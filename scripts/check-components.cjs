// Component integration checks; canvas/image rendering mocked. No network requests.
const fs=require('fs'),path=require('path'),assert=require('assert'),Module=require('module'),Vue=require('vue');
Vue.config.silent=true;
const root=path.resolve(__dirname,'..'),original=Module._extensions['.js'];
// The tested source modules use only default/named imports and const/default exports.
function compile(m,file,s){
 const names=[...s.matchAll(/export const (\w+)/g)].map(x=>x[1]);
 s=s.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g,(_,names,src)=>`const {${names}}=require('${src}');`)
 .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g,(_,name,src)=>`const ${name}=require('${src}').default;`)
 .replace(/export default /g,'module.exports.default = ').replace(/export const /g,'const ');
 m._compile(s+'\n'+names.map(n=>`exports.${n}=${n};`).join('\n'),file);
}
Module._extensions['.js']=(m,f)=>f.startsWith(path.join(root,'src'))?compile(m,f,fs.readFileSync(f,'utf8')):original(m,f);
Module._extensions['.vue']=(m,f)=>compile(m,f,fs.readFileSync(f,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]);
global.document={hidden:false,visibilityState:'visible',addEventListener(){},removeEventListener(){},createElement(){return {getContext:()=>({drawImage(){},beginPath(){},ellipse(){},fill(){}}),toDataURL:()=> 'mock-image'}}};
const tick=()=>Vue.nextTick();
async function run(v){
 for(const k of Object.keys(require.cache))if(k.startsWith(path.join(root,'src')))delete require.cache[k];
 global.window={location:{search:`?version=${v}&preview=1`},crypto:require('crypto').webcrypto};
 const timing=require('../src/timing').default,variant=require('../src/variants').variant,rows=[];
 const magpie={addTrialData:r=>rows.push(r),addExpData(){},nextScreen(){}};
 async function make(file,props={}){const opts=require('../src/'+file).default;const vm=new Vue({...opts,mixins:[timing],propsData:props,beforeCreate(){this.$magpie=magpie},render(h){return h('div')}});vm.$mount();await tick();return vm}
 const intro=await make('InstructionsWithBack.vue');assert.equal(intro.variant.finalTask,v%2?'summary':'examples');magpie.nextScreen();intro.$destroy();
 const pre=await make('InstructionsPreGame.vue');assert.equal(pre.pages.some(p=>p.text.includes('rating on a slider')),variant.slider);magpie.nextScreen();pre.$destroy();
 let game={participant:0,opponent:0,confidence:50,instructionsFreeTokenUsed:false,scoreFreeTokenUsed:false,instructionsUsesTotal:0,scoreChecksTotal:0,firstRedSelection:null};
 const trials=require('../src/trials').default;
 for(let i=0;i<16;i++){
  const t=trials[i],vm=await make('GridTrial.vue',{trial:t,roundNumber:i+1,isLast:i===15,gameState:game});
  vm.$on('update-game',g=>{game=g;vm.gameState=g});vm.$refs.mazeImage={naturalWidth:400,naturalHeight:400};vm.mazeLoaded();await tick();assert.equal(vm.configurationError,'');
  const route=[Array.from(t.start)];let[r,c]=t.start;
  while(r!==t.end[0]){r+=Math.sign(t.end[0]-r);route.push([r,c])}while(c!==t.end[1]){c+=Math.sign(t.end[1]-c);route.push([r,c])}
  const choose=async p=>{for(const[r,c]of p){vm.selectCell(r,c);await tick()}};
  if(i===0){await choose([route[0]]);vm.resetPath();vm.openRules();await tick();vm.closeRules();await tick();vm.startScoreTest();await tick();await choose([route[0]]);vm.resetPath();await choose(route);vm.checkScore();await tick();
   if(v>=5){assert.equal(vm.stage,'test-explanation');vm.submitTestExplanation();assert.equal(vm.stage,'test-explanation');vm.testExplanation='Testing a predicted score.';vm.submitTestExplanation();await tick()}
   assert.equal(vm.stage,'test-result');vm.endScoreTest();await tick();vm.startScoreTest();await tick();vm.cancelScoreTest();await tick();assert.equal(vm.scoreCheckUses,1);assert.equal(vm.scoreCheckCost,0);
  }
  await choose(route);assert(vm.isComplete);vm.confirmPath();await tick();assert.equal(vm.stage,'feedback');vm.opponentLoaded();await tick();vm.showConfidence();await tick();
  if(variant.slider){assert.equal(vm.stage,'confidence');vm.confidence=65;vm.touchConfidence();vm.finishTrial();await tick()}
  assert(vm.finished);vm.$destroy();
 }
 if(variant.finalTask==='examples'){const vm=await make('FinalExamples.vue');for(const route of [[[0,1],[1,1],[2,1],[3,1],[3,2],[3,3]],[[3,1],[3,2],[2,2],[1,2],[0,2],[0,1]]]){for(const[r,c]of route)vm.choose(r,c);await tick();assert(vm.complete);vm.stage='explanation';await tick();vm.explanation='Orange adds points.\nThis is an optimal path.';vm.save();await tick()}vm.$destroy();assert(rows.filter(r=>r.row_type==='example_response').every(r=>r.selected_path_score===2))}
 const q=await make('Questionnaire.vue');assert.equal(q.step,variant.finalTask==='summary'?1:2);
 if(variant.finalTask==='summary'){q.strategyExplanation='• Start at green.\n• End at yellow.';q.step=2;await tick()}
 q.peculiar=v%2?'no':'yes';if(q.peculiar==='yes'){q.step=3;await tick();q.peculiarExplanation='Unexpected score.'}q.step=4;await tick();q.suspicion=v%2?'no':'yes';q.step=5;await tick();
 if(q.suspicion==='yes')q.suspicionYesExplanation='The score differed, for example on purple.';else q.suspicionNoExplanation='The rules seemed reliable.';
 assert(q.canSubmit);q.submitQuestionnaire();q.$destroy();
 assert.equal(rows.filter(r=>r.row_type==='path').length,16);assert.equal(rows.filter(r=>r.row_type==='confidence').length,16);
 for(const mode of ['main','test'])assert.equal(rows.filter(r=>r.event==='path_reset'&&r.mode===mode).length,1);
 for(const[phase,count]of [['opponent_review',16],['awareness_slider',variant.slider?16:0],['test_explanation',v>=5?1:0]])assert.equal(rows.filter(r=>r.row_type==='phase_timing'&&r.phase===phase).length,count,phase);
 assert(rows.filter(r=>r.row_type==='confidence').every(r=>variant.slider?r.confidence===65&&r.confidence_rt_ms>=0:r.confidence===null&&r.confidence_rt_ms===null));
 assert(rows.every(r=>r.experiment_version===String(v)));assert(rows.filter(r=>r.row_type==='phase_timing').every(r=>r.duration_ms>=0&&r.visible_duration_ms>=0&&r.visible_duration_ms<=r.duration_ms+1));
 assert.equal(rows.find(r=>r.event==='score_checked').test_explanation,v>=5?'Testing a predicted score.':'');
 console.log(`PASS version ${v}: 16 trials, ${rows.length} event/response/timing rows; help, resets, timing, final task and questionnaire.`);
}
(async()=>{for(let v=1;v<=6;v++)await run(v)})().catch(e=>{console.error(e);process.exit(1)});
