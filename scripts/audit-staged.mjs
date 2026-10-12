// Scoped pre-publication check; this is not a comprehensive security certification.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const files=execFileSync('git',['diff','--cached','--name-only','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const rules=[
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
 ['GitHub-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
 ['AWS-access-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
 ['JWT-shaped-token',/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/],
 ['Vercel-bypass-secret',/x-vercel-protection-bypass\s*[:=]\s*["'][A-Za-z0-9_-]{16,}/i],
 ['literal-credential',/(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][A-Za-z0-9_+\/-]{20,}["']/i]
];
const findings=[],manifest=[];
let textFiles=0;
for(const file of files){
 const bytes=await readFile(file);
 manifest.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 if(!/\.(?:html?|js|mjs|cjs|json|css|md|txt)$/.test(file))continue;
 textFiles++;
 for(const [type,pattern] of rules)if(pattern.test(bytes.toString('utf8')))findings.push({file,type});
}
const result={verifiedAt:new Date().toISOString(),scope:'Explicit staged publication assets; common credential patterns, not a complete security certification; values deliberately omitted',status:findings.length?'REVIEW_REQUIRED':'PASS',fileCount:files.length,textFiles,findings,manifest};
if(!process.argv.includes('--check'))await writeFile('preview/revisions/v1.2/publication-audit.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,fileCount:files.length,textFiles,findings},null,2));
if(findings.length)process.exitCode=1;
