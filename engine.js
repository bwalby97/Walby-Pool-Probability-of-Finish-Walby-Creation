/* Walby Pool Probability of Finish engine. Exact enumeration of every remaining game outcome. */
(function(root){
'use strict';
var ROUND_PTS=[10,20,40,80,160,320];
/* Standard 63-game bracket. Game ids 0..62. Rounds: 0=R64(32 games) 1=R32(16) 2=S16(8) 3=E8(4) 4=F4(2) 5=Title(1)
Regions r=0..3, each region has 8 R64 games, 4 R32, 2 S16, 1 E8. Region order = F4 pairing: region0 vs region1, region2 vs region3. */
function buildGames(){
var games=[],id=0,i,r,base={};
for(r=0;r<4;r++){ for(i=0;i<8;i++){games.push({id:id,round:0,region:r,slot:i,feeders:null});id++;} }
var prev=[];
for(r=0;r<4;r++){prev[r]=[];for(i=0;i<8;i++)prev[r].push(r*8+i);}
var round=1;
while(round<=3){
for(r=0;r<4;r++){var cur=[];for(i=0;i<prev[r].length;i+=2){games.push({id:id,round:round,region:r,slot:i/2,feeders:[prev[r][i],prev[r][i+1]]});cur.push(id);id++;}prev[r]=cur;}
round++;
}
var e8=[prev[0][0],prev[1][0],prev[2][0],prev[3][0]];
games.push({id:id,round:4,region:-1,slot:0,feeders:[e8[0],e8[1]]});var f0=id++;
games.push({id:id,round:4,region:-1,slot:1,feeders:[e8[2],e8[3]]});var f1=id++;
games.push({id:id,round:5,region:-1,slot:0,feeders:[f0,f1]});
return games;
}
var GAMES=buildGames();
/* Team slots: R64 game g (0..31) has participants teams[2g], teams[2g+1] (team ids as strings). */
function participants(g,winner,teams){
var G=GAMES[g];
if(!G.feeders) return [teams[2*g],teams[2*g+1]];
return [winner[G.feeders[0]],winner[G.feeders[1]]];
}
/* run(cfg)
cfg.teams: array of 64 team names in slot order (R64 game g = teams[2g] vs teams[2g+1])
cfg.results: {gameId: winnerName} for decided games
cfg.entries: [{name, picks:[63 names or null]}]
cfg.mode: 'equal'|'vegas'|'user' ; cfg.weights:{team:weight}  (title odds; game prob = wA/(wA+wB))
cfg.prizes: [.7,.15,...] fraction of pool by place
cfg.maxUndecided (default 16)
*/
function run(cfg){
var teams=cfg.teams,res=cfg.results||{},entries=cfg.entries,n=entries.length,prizes=cfg.prizes,mode=cfg.mode||'equal',W=cfg.weights||{};
var winner=new Array(63),score=new Float64Array(n),undec=[],g,e;
// decided games and base points
for(g=0;g<63;g++){ if(res[g]!=null){winner[g]=res[g];} else undec.push(g); }
var maxU=cfg.maxUndecided||16;
if(undec.length>maxU) return {error:'tooMany',undecided:undec.length};
var base=new Float64Array(n);
for(e=0;e<n;e++){var s=cfg.baseOverride?cfg.baseOverride[e]:(entries[e].base!=null?entries[e].base:0);
if(!cfg.baseOverride && entries[e].base==null){for(g=0;g<63;g++){ if(res[g]!=null && entries[e].picks[g]===res[g]) s+=ROUND_PTS[GAMES[g].round]; }}
base[e]=s; score[e]=s;}
// pickers: for each undecided game, map team -> entry index list
var pickers={};
undec.forEach(function(g){var m={};for(e=0;e<n;e++){var t=entries[e].picks[g];if(t!=null){(m[t]||(m[t]=[])).push(e);}}pickers[g]=m;});
var pts=function(g){return ROUND_PTS[GAMES[g].round];};
// outputs
var topN=[1,2,3,4,5,6,7,8,9,10],K=topN.length;
var pTop=new Float64Array(n*K),cTop=new Float64Array(n*K),ePrize=new Float64Array(n),eRank=new Float64Array(n),pWin1=new Float64Array(n),any1=new Float64Array(n);
var wTot=0,leaves=0,keys=new Float64Array(n);
var minS=new Float64Array(n),maxS=new Float64Array(n);for(e=0;e<n;e++){minS[e]=1e9;maxS[e]=-1;}
function weight(a,b){ if(mode==='equal') return 0.5; var wa=W[a]!=null?W[a]:1e-4,wb=W[b]!=null?W[b]:1e-4; return wa/(wa+wb); }
function leaf(p){
leaves++;wTot+=p;
for(e=0;e<n;e++){ keys[e]=score[e]*4096+e; if(score[e]<minS[e])minS[e]=score[e]; if(score[e]>maxS[e])maxS[e]=score[e]; }
var sorted=Float64Array.from(keys).sort(); // ascending
var i=n-1,pos=1;
while(i>=0){
var sc=Math.floor(sorted[i]/4096),j=i;
while(j>=0 && Math.floor(sorted[j]/4096)===sc) j--;
var k=i-j,first=pos,last=pos+k-1,share=0,ci;
for(ci=first;ci<=last;ci++) share+=(ci<=prizes.length?prizes[ci-1]:0);
share/=k;
for(var t=i;t>j;t--){
var idx=sorted[t]-Math.floor(sorted[t]/4096)*4096; idx=Math.round(idx);
ePrize[idx]+=p*share; eRank[idx]+=p*(first+last)/2;
if(first===1){pWin1[idx]+=p/k;any1[idx]++;}
for(var q=0;q<K;q++){var N=topN[q];var inN=Math.max(0,Math.min(last,N)-first+1)/k; if(inN>0){pTop[idx*K+q]+=p*inN; cTop[idx*K+q]+=inN;}}
}
pos+=k;i=j;
}
}
function dfs(d,p){
if(d===undec.length){leaf(p);return;}
var g=undec[d],pr=participants(g,winner,teams),a=pr[0],b=pr[1],pa=weight(a,b),pt=pts(g);
var opts=[[a,pa],[b,1-pa]];
for(var o=0;o<2;o++){
var tm=opts[o][0],list=pickers[g][tm]||[],li;
winner[g]=tm;
for(li=0;li<list.length;li++)score[list[li]]+=pt;
dfs(d+1,p*opts[o][1]);
for(li=0;li<list.length;li++)score[list[li]]-=pt;
}
}
dfs(0,1);
var out=[];
for(e=0;e<n;e++){
var r={name:entries[e].name,base:base[e],max:maxS[e]<0?base[e]:maxS[e],min:minS[e]>1e8?base[e]:minS[e],ePrize:ePrize[e]/wTot,eRank:eRank[e]/wTot,pWin:pWin1[e]/wTot,any1:any1[e],top:{},cnt:{}};
for(var q=0;q<K;q++){r.top[topN[q]]=pTop[e*K+q]/wTot;r.cnt[topN[q]]=cTop[e*K+q];}
out.push(r);
}
return {entries:out,leaves:leaves,undecided:undec.length};
}
var api={GAMES:GAMES,ROUND_PTS:ROUND_PTS,run:run,participants:participants};
if(typeof module!=='undefined')module.exports=api; else root.POF=api;
})(this);
