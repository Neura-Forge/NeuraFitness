// Run in a controlled staging/release job. Read-only; never prints credentials or DB rows.
const { PrismaClient } = require('@prisma/client');
function configuration(env) {
 const required=['DATABASE_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SITE_URL'];
 const missing=required.filter(k=>!env[k]?.trim());
 if(missing.length) return {ok:false,code:'MISSING_CONFIGURATION',missing};
 try {
  const db=new URL(env.DATABASE_URL),auth=new URL(env.NEXT_PUBLIC_SUPABASE_URL),site=new URL(env.NEXT_PUBLIC_SITE_URL);
  if(!['postgres:','postgresql:'].includes(db.protocol)||auth.protocol!=='https:'||site.protocol!=='https:')return {ok:false,code:'INVALID_CONFIGURATION'};
  const ref=auth.hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
  const dbRef=db.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)?.[1] || decodeURIComponent(db.username).match(/^postgres\.([a-z0-9]+)$/)?.[1];
  if(!ref||!dbRef)return {ok:false,code:'DATABASE_IDENTITY_UNVERIFIED'};
  if(ref!==dbRef)return {ok:false,code:'DATABASE_AUTH_PROJECT_MISMATCH'};
  return {ok:true,code:'CONFIGURATION_MATCHES'};
 } catch {return {ok:false,code:'INVALID_CONFIGURATION'};}
}
async function main(){
 const config=configuration(process.env);console.log(JSON.stringify(config));if(!config.ok){process.exitCode=1;return;}
 const db=new PrismaClient();
 try {
  const rows=await db.$queryRaw`SELECT to_regclass('public."Gym"') IS NOT NULL AS gym, to_regclass('public."Member"') IS NOT NULL AS member, to_regclass('public."User"') IS NOT NULL AS staff`;
  const ok=Boolean(rows[0]?.gym&&rows[0]?.member&&rows[0]?.staff);
  console.log(JSON.stringify({ok,code:ok?'APPLICATION_SCHEMA_PRESENT':'APPLICATION_SCHEMA_MISSING'}));if(!ok)process.exitCode=1;
 } catch(error){const code=/^P\d{4}$/.test(error?.code)?error.code:'DATABASE_CHECK_FAILED';console.error(JSON.stringify({ok:false,code}));process.exitCode=1;}
 finally{await db.$disconnect();}
}
module.exports={configuration};if(require.main===module)main();
