// Read back the exact authorized repository/branch; never merges or deploys.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const repo='jin358-cmd/RRCC',branch='feature/rrcc-hantang-ui-refinement-20261013';
const run=(program,args)=>execFileSync(program,args,{encoding:'utf8',maxBuffer:64*1024*1024}).trim();
const api=endpoint=>JSON.parse(run('gh',['api',endpoint]));
const metadata=api(`repos/${repo}`),pr=JSON.parse(run('gh',['pr','view','1','--repo',repo,'--json','number,url,state,baseRefName,headRefName,headRefOid,mergedAt']));
if(run('git',['remote','get-url','origin'])!==`https://github.com/${repo}.git`)throw Error('Unexpected origin');
run('git',['fetch','origin',`+refs/heads/${branch}:refs/remotes/origin/${branch}`,'+refs/heads/main:refs/remotes/origin/main']);
const main=run('git',['rev-parse','origin/main']),head=run('git',['rev-parse',`origin/${branch}`]),local=run('git',['rev-parse','HEAD']);
const mainFiles=run('git',['ls-tree','--name-only','origin/main']).split('\n');
const ref=`origin/${branch}`;
const files=execFileSync('git',['ls-tree','-rz','--name-only',ref],{encoding:'utf8'}).split('\0').filter(Boolean);
const hashes=[];
for(const file of files){
 const remoteBytes=execFileSync('git',['show',`${ref}:${file}`],{maxBuffer:64*1024*1024});
 const localBytes=await readFile(file);
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
 const remoteSha256=sha(remoteBytes),localSha256=sha(localBytes);
 hashes.push({file,remoteSha256,localSha256,status:remoteSha256===localSha256?'PASS':'FAIL'});
}
const deployments=api(`repos/${repo}/deployments?per_page=100`);
// Preview deployment is now explicitly authorized; Production records remain forbidden.
const previewDeploymentsOnly=deployments.every(d=>String(d.environment).toLowerCase()==='preview'&&d.production_environment!==true);
const checks={repository:metadata.full_name===repo,publicRepository:metadata.visibility==='public',writePermission:metadata.permissions?.push===true,defaultBranch:metadata.default_branch==='main',mainUnchanged:main==='5e722c043c2164da5795e5a6523a6b3dfd946d59',mainReadmeOnly:mainFiles.length===1&&mainFiles[0]==='README.md',headMatchesLocal:head===local,prHeadMatches:pr.headRefOid===head,prOpenUnmerged:pr.state==='OPEN'&&pr.mergedAt===null,prBase:pr.baseRefName==='main'&&pr.headRefName===branch,allFilesMatch:hashes.every(x=>x.status==='PASS'),githubDeploymentRecordsPreviewOnly:previewDeploymentsOnly};
const result={verifiedAt:new Date().toISOString(),repository:repo,branch,verifiedCommit:head,mainCommit:main,pr,checks,files:hashes,scope:'Authenticated GitHub API metadata plus freshly fetched Git blobs, SHA-256 compared with exact local publication files. No merge or deployment performed; no claim about unrelated hosting accounts.'};
const outputArgument=process.argv.find(value=>value.startsWith('--output='));
if(!process.argv.includes('--check'))await writeFile(outputArgument?.slice('--output='.length)||'docs/verification/github-readback-v1.2.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:Object.values(checks).every(Boolean)?'PASS':'FAIL',verifiedCommit:head,mainCommit:main,pr:pr.url,fileCount:hashes.length,checks},null,2));
if(!Object.values(checks).every(Boolean))process.exitCode=1;
