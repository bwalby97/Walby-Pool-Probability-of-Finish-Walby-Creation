/* SAMPLE data: made-up teams and 300 made-up entries. Replace this file with real picks. */
(function(){
var seed=12345;function rnd(){seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296}
var RG=['Midwest','West','East','South'],ord=[1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15],T=[],S={},E=window.POF;
RG.forEach(function(r){ord.forEach(function(s){var n=r+' '+s;T.push(n);S[n]=s})});
function st(t){return 1/Math.pow(S[t],0.9)}
function sim(tw){var w={},g;for(g=0;g<63;g++){var p=E.participants(g,w,T),a=st(p[0])*(tw?tw[p[0]]:1),b=st(p[1])*(tw?tw[p[1]]:1);w[g]=rnd()<a/(a+b)?p[0]:p[1]}return w}
var act=sim(null),res={},g,i;for(g=0;g<48;g++)res[g]=act[g];
var ents=[];for(i=0;i<300;i++){var tw={};T.forEach(function(t){tw[t]=0.4+rnd()*1.6});var pk=sim(tw),p=[];for(g=0;g<63;g++)p.push(pk[g]);ents.push({name:'Sample Entry '+(i+1),picks:p})}
var V={},tot=0;T.forEach(function(t){V[t]=Math.pow(st(t),2);tot+=V[t]});T.forEach(function(t){V[t]=Math.round(V[t]/tot*1e6)/1e6});
window.POOL_DATA={season:2026,sample:true,asOf:'sample data (not real picks)',teams:T,results:res,seeds:S,regions:RG,
pools:{main:{label:'Main Pool',fee:15,pot:null,prizes:[.7,.15,.08,.05,.02],vegas:V,user:V,entries:ents}}};
})();
