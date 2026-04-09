import { useState, useEffect, useRef, useCallback } from "react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYw3DNfteGUApE97zpPScPgVCrHjNXTU-kuwabwQNviLmsaW4gSEd6hqY1FoTJsxu4HQ/exec";
const TOKEN = "CIBS2026";
const REPORT_URL = "https://esmart-report.vercel.app";

const getParam = k => { try { return new URLSearchParams(window.location.search).get(k)||""; } catch { return ""; } };
const today = () => new Date().toISOString().split("T")[0];
const isBirthday = dob => { try { const d=new Date(dob); return d.getMonth()===new Date().getMonth()&&d.getDate()===new Date().getDate(); } catch { return false; } };
const calcAge = dob => { try { const ms=Date.now()-new Date(dob).getTime(); return Math.floor(ms/(1000*60*60*24*365.25)); } catch { return null; } };
const calcWeekNo = baseline => { try { const ms=Date.now()-new Date(baseline).getTime(); return Math.max(1,Math.floor(ms/(1000*60*60*24*7))+1); } catch { return 1; } };

const T = {
  en: {
    appName:"eSMART Weekly", org:"Central Institute of Behavioural Sciences, Nagpur",
    drMessage:"This message is from Dr. Shailesh Pangaonkar, Central Institute of Behavioural Sciences, Nagpur.\n\nPlease do not miss your child's weekly check-in — it adds health and happiness to your child's life. We are here with you every step of the way.",
    drSign:"— Dr. Shailesh V. Pangaonkar\nDirector & Consultant Psychiatrist\nCIBS Nagpur · +91 712 254 8966",
    chooseLang:"Choose your language", begin:"Begin →",
    enterDetails:"Child's Details", fileNoLabel:"Registration Number (FileNo)",
    fileNoHint:"e.g. CIBS-26-0042", dobLabel:"Child's Date of Birth", continueBtn:"Continue →",
    loading:"Loading your child's profile…", generating:"Preparing your weekly guidance…",
    birthday:"Today is {name}'s Birthday! 🎂",
    birthdayMsg:"Happy Birthday {name}! Wishing you lots of joy and happiness from Dr. Pangaonkar and the entire CIBS family!",
    weekLabel:"Week {n} of 26",
    weekGreeting:["Welcome to your first check-in! You have taken a wonderful step.",
      "Week {n} — You are doing great. Keep going!",
      "One month complete! You are exceptional.",
      "Week {n} — Halfway there. Look how far you have come!",
      "Week 26 — You completed 6 months. {name} is lucky to have you!"],
    notifTitle:"{name}'s weekly check-in is ready!",
    notifBody:"Dr. Pangaonkar is waiting for your update 🌟",
    notifAllow:"Allow weekly reminders on this device",
    q_behaviour:"How was {name}'s behaviour at home this week?",
    q_school:"Did {name} go to school this week?",
    q_sleep:"How well did {name} sleep this week?",
    q_appetite:"How was {name}'s appetite this week?",
    q_attention:"How was {name}'s attention and focus this week?",
    q_mood:"How was {name}'s mood this week?",
    q_anxiety:"How much worry or anxiety did {name} show this week?",
    q_aggression:"How much aggression did {name} show this week?",
    q_social:"How well did {name} interact with others this week?",
    q_learning:"How was {name}'s learning effort at school this week?",
    q_daily:"How well did {name} manage daily activities this week?",
    q_intervention:"What support or activity did you do for {name} this week?",
    q_helped:"Did it help {name}?",
    q_parentStress:"How stressed did YOU feel this week as a parent/caregiver?",
    q_flag:"Is there anything you want to tell the doctor this week?",
    sl_0:"None", sl_1:"Very mild", sl_2:"Mild", sl_3:"Mild",
    sl_4:"Moderate", sl_5:"Moderate", sl_6:"Significant",
    sl_7:"Significant", sl_8:"Severe", sl_9:"Severe", sl_10:"Extreme",
    sl_good_0:"Very Poor", sl_good_5:"Average", sl_good_10:"Excellent",
    em_labels:["Excellent","Good","Average","Difficult","Very Hard"],
    sc_yes:"Yes ✅", sc_partial:"Partially 🏃", sc_no:"Stayed home 🏠",
    ap_good:"Good 🍽️", ap_ok:"So-so 😐", ap_poor:"Poor 😟",
    int_therapy:"Therapy Session", int_school:"School Support",
    int_home:"Home Activity", int_medical:"Medical / Medication", int_none:"Could not do",
    h_lot:"A lot 🌟", h_some:"A little 🙂", h_unsure:"Not sure 🤔", h_no:"No effect ➡️",
    f_fine:"All fine ✅", f_one:"One thing ⚠️", f_urgent:"Urgent 🚨",
    fb_title:"{name}'s Week {n} Report",
    fb_celebration:"🎉 What went well",
    fb_comparison:"📊 This week vs last week",
    fb_guidance:"💡 What to do this week",
    fb_avoid:"🚫 What to avoid",
    fb_reminder:"💊 Reminder",
    fb_parent:"💪 A message for you",
    fb_better:"↓ Better", fb_same:"→ Same", fb_worse:"↑ More",
    shareBtn:"📲 Share on WhatsApp", saveBtn:"📥 Save", doneBtn:"✅ Done",
    nextWeek:"See you next week! 🙏",
  },
  hi: {
    appName:"eSMART साप्ताहिक", org:"केंद्रीय व्यावहारिक विज्ञान संस्थान, नागपुर",
    drMessage:"यह संदेश डॉ. शैलेश पानगावकर की ओर से है, केंद्रीय व्यावहारिक विज्ञान संस्थान, नागपुर।\n\nकृपया अपने बच्चे का साप्ताहिक चेक-इन न चूकें — यह आपके बच्चे के जीवन में स्वास्थ्य और खुशी जोड़ता है।",
    drSign:"— डॉ. शैलेश वी. पानगावकर\nनिदेशक एवं परामर्श मनोचिकित्सक\nCIBS नागपुर",
    chooseLang:"अपनी भाषा चुनें", begin:"शुरू करें →",
    enterDetails:"बच्चे की जानकारी", fileNoLabel:"पंजीकरण संख्या (FileNo)",
    fileNoHint:"जैसे CIBS-26-0042", dobLabel:"बच्चे की जन्म तिथि", continueBtn:"आगे →",
    loading:"प्रोफाइल लोड हो रही है…", generating:"मार्गदर्शन तैयार हो रहा है…",
    birthday:"आज {name} का जन्मदिन है! 🎂",
    birthdayMsg:"जन्मदिन मुबारक {name}! डॉ. पानगावकर और CIBS परिवार की ओर से शुभकामनाएं!",
    weekLabel:"सप्ताह {n} / 26",
    weekGreeting:["पहले चेक-इन में स्वागत! आपने शानदार कदम उठाया।",
      "सप्ताह {n} — आप बहुत अच्छा कर रहे हैं!",
      "एक महीना पूरा! आप कमाल कर रहे हैं।",
      "सप्ताह {n} — आधा रास्ता तय हो गया!",
      "सप्ताह 26 — 6 महीने पूरे! {name} बहुत खुशकिस्मत है।"],
    notifTitle:"{name} का साप्ताहिक चेक-इन!",
    notifBody:"डॉ. पानगावकर आपका इंतजार कर रहे हैं 🌟",
    notifAllow:"साप्ताहिक अनुस्मारक की अनुमति दें",
    q_behaviour:"इस सप्ताह घर पर {name} का व्यवहार कैसा था?",
    q_school:"क्या {name} इस सप्ताह स्कूल गया/गई?",
    q_sleep:"इस सप्ताह {name} की नींद कैसी थी?",
    q_appetite:"इस सप्ताह {name} की भूख कैसी थी?",
    q_attention:"इस सप्ताह {name} का ध्यान कैसा था?",
    q_mood:"इस सप्ताह {name} का मूड कैसा था?",
    q_anxiety:"इस सप्ताह {name} में कितनी चिंता दिखी?",
    q_aggression:"इस सप्ताह {name} में कितनी आक्रामकता दिखी?",
    q_social:"इस सप्ताह {name} दूसरों से कितना मिला/मिली?",
    q_learning:"इस सप्ताह स्कूल में {name} की मेहनत कैसी थी?",
    q_daily:"इस सप्ताह {name} ने रोजमर्रा के काम कितने अच्छे किए?",
    q_intervention:"इस सप्ताह आपने {name} के लिए क्या किया?",
    q_helped:"क्या इससे {name} को फायदा हुआ?",
    q_parentStress:"इस सप्ताह आप खुद कितना तनाव महसूस कर रहे थे?",
    q_flag:"क्या आप डॉक्टर को कुछ बताना चाहते हैं?",
    sl_0:"बिल्कुल नहीं", sl_1:"बहुत हल्का", sl_2:"हल्का", sl_3:"हल्का",
    sl_4:"मध्यम", sl_5:"मध्यम", sl_6:"महत्वपूर्ण",
    sl_7:"महत्वपूर्ण", sl_8:"गंभीर", sl_9:"गंभीर", sl_10:"अत्यंत गंभीर",
    sl_good_0:"बहुत खराब", sl_good_5:"ठीक-ठाक", sl_good_10:"बहुत अच्छा",
    em_labels:["बहुत अच्छा","अच्छा","ठीक","मुश्किल","बहुत मुश्किल"],
    sc_yes:"हाँ ✅", sc_partial:"आंशिक 🏃", sc_no:"घर पर 🏠",
    ap_good:"अच्छी 🍽️", ap_ok:"ठीक 😐", ap_poor:"कम 😟",
    int_therapy:"थेरेपी", int_school:"विद्यालय", int_home:"घरेलू", int_medical:"दवाई", int_none:"नहीं हुआ",
    h_lot:"बहुत 🌟", h_some:"थोड़ा 🙂", h_unsure:"पता नहीं 🤔", h_no:"कोई असर नहीं ➡️",
    f_fine:"सब ठीक ✅", f_one:"एक बात ⚠️", f_urgent:"जरूरी 🚨",
    fb_title:"{name} का सप्ताह {n} रिपोर्ट",
    fb_celebration:"🎉 क्या अच्छा रहा",
    fb_comparison:"📊 पिछले सप्ताह से तुलना",
    fb_guidance:"💡 इस सप्ताह क्या करें",
    fb_avoid:"🚫 क्या न करें",
    fb_reminder:"💊 याद रखें",
    fb_parent:"💪 आपके लिए संदेश",
    fb_better:"↓ बेहतर", fb_same:"→ समान", fb_worse:"↑ ज्यादा",
    shareBtn:"📲 WhatsApp", saveBtn:"📥 सहेजें", doneBtn:"✅ हो गया",
    nextWeek:"अगले सप्ताह मिलते हैं! 🙏",
  },
  mr: {
    appName:"eSMART साप्ताहिक", org:"केंद्रीय वर्तणूक विज्ञान संस्था, नागपूर",
    drMessage:"हा संदेश डॉ. शैलेश पानगावकर यांच्याकडून आहे, केंद्रीय वर्तणूक विज्ञान संस्था, नागपूर.\n\nकृपया तुमच्या मुलाचा साप्ताहिक चेक-इन चुकवू नका.",
    drSign:"— डॉ. शैलेश वी. पानगावकर\nसंचालक, CIBS नागपूर",
    chooseLang:"तुमची भाषा निवडा", begin:"सुरू करा →",
    enterDetails:"मुलाची माहिती", fileNoLabel:"नोंदणी क्रमांक (FileNo)",
    fileNoHint:"उदा. CIBS-26-0042", dobLabel:"मुलाची जन्मतारीख", continueBtn:"पुढे →",
    loading:"प्रोफाइल लोड होत आहे…", generating:"मार्गदर्शन तयार होत आहे…",
    birthday:"आज {name} चा वाढदिवस! 🎂",
    birthdayMsg:"वाढदिवसाच्या शुभेच्छा {name}! डॉ. पानगावकर आणि CIBS परिवाराकडून!",
    weekLabel:"आठवडा {n} / 26",
    weekGreeting:["पहिल्या चेक-इनमध्ये स्वागत! तुम्ही उत्तम पाऊल उचलले.",
      "आठवडा {n} — तुम्ही खूप चांगले करत आहात!",
      "एक महिना पूर्ण! तुम्ही कमाल आहात.",
      "आठवडा {n} — अर्धा रस्ता पूर्ण!",
      "आठवडा 26 — 6 महिने पूर्ण! {name} नशीबवान आहे."],
    notifTitle:"{name} चा साप्ताहिक चेक-इन!",
    notifBody:"डॉ. पानगावकर वाट पाहत आहेत 🌟",
    notifAllow:"साप्ताहिक स्मरणपत्राची परवानगी द्या",
    q_behaviour:"या आठवड्यात घरी {name} चे वर्तन कसे होते?",
    q_school:"या आठवड्यात {name} शाळेत गेला/गेली का?",
    q_sleep:"या आठवड्यात {name} ची झोप कशी होती?",
    q_appetite:"या आठवड्यात {name} ची भूक कशी होती?",
    q_attention:"या आठवड्यात {name} चे लक्ष कसे होते?",
    q_mood:"या आठवड्यात {name} चा मूड कसा होता?",
    q_anxiety:"या आठवड्यात {name} मध्ये किती काळजी दिसली?",
    q_aggression:"या आठवड्यात {name} मध्ये किती आक्रमकता दिसली?",
    q_social:"या आठवड्यात {name} इतरांशी कसे मिसळला?",
    q_learning:"या आठवड्यात शाळेत {name} चा प्रयत्न कसा होता?",
    q_daily:"या आठवड्यात {name} ने रोजची कामे किती केली?",
    q_intervention:"या आठवड्यात तुम्ही {name} साठी काय केले?",
    q_helped:"त्याचा {name} ला फायदा झाला का?",
    q_parentStress:"या आठवड्यात तुम्हाला स्वतःला किती ताण जाणवला?",
    q_flag:"या आठवड्यात डॉक्टरांना काही सांगायचे आहे का?",
    sl_0:"अजिबात नाही", sl_1:"अगदी सौम्य", sl_2:"सौम्य", sl_3:"सौम्य",
    sl_4:"मध्यम", sl_5:"मध्यम", sl_6:"लक्षणीय",
    sl_7:"लक्षणीय", sl_8:"तीव्र", sl_9:"तीव्र", sl_10:"अत्यंत तीव्र",
    sl_good_0:"अगदी खराब", sl_good_5:"ठीक आहे", sl_good_10:"उत्तम",
    em_labels:["खूप छान","चांगले","ठीक","कठीण","खूप कठीण"],
    sc_yes:"होय ✅", sc_partial:"अंशतः 🏃", sc_no:"घरी 🏠",
    ap_good:"चांगली 🍽️", ap_ok:"ठीक 😐", ap_poor:"कमी 😟",
    int_therapy:"थेरपी", int_school:"शाळा", int_home:"घर", int_medical:"औषध", int_none:"झाले नाही",
    h_lot:"खूप 🌟", h_some:"थोडा 🙂", h_unsure:"माहीत नाही 🤔", h_no:"परिणाम नाही ➡️",
    f_fine:"सर्व ठीक ✅", f_one:"एक गोष्ट ⚠️", f_urgent:"तातडीचे 🚨",
    fb_title:"{name} चा आठवडा {n} अहवाल",
    fb_celebration:"🎉 काय चांगले झाले",
    fb_comparison:"📊 मागील आठवड्याशी तुलना",
    fb_guidance:"💡 या आठवड्यात काय करावे",
    fb_avoid:"🚫 काय टाळावे",
    fb_reminder:"💊 लक्षात ठेवा",
    fb_parent:"💪 तुमच्यासाठी संदेश",
    fb_better:"↓ बरे", fb_same:"→ समान", fb_worse:"↑ जास्त",
    shareBtn:"📲 WhatsApp", saveBtn:"📥 जतन", doneBtn:"✅ झाले",
    nextWeek:"पुढच्या आठवड्यात! 🙏",
  },
};

function Slider({ value, onChange, reversed=false, t }) {
  const pct = value/10;
  const r = Math.round(255*(reversed?(1-pct):pct));
  const g = Math.round(255*(reversed?pct:(1-pct)));
  const color = `rgb(${r},${g},60)`;
  return (
    <div style={{padding:"8px 0"}}>
      <div style={{position:"relative",height:44,display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",left:0,right:0,height:8,borderRadius:4,
          background:"linear-gradient(to right,#22c55e,#facc15,#ef4444)",opacity:0.3}}/>
        <input type="range" min={0} max={10} step={1} value={value}
          onChange={e=>onChange(Number(e.target.value))}
          style={{width:"100%",appearance:"none",WebkitAppearance:"none",
            background:"transparent",cursor:"pointer",position:"relative",zIndex:2,height:44,margin:0}}/>
        <style>{`input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;}`}</style>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginTop:2}}>
        <span style={{color:"#22c55e",fontWeight:600}}>0</span>
        <div style={{textAlign:"center",fontSize:13,fontWeight:800,color,background:`${color}15`,borderRadius:8,padding:"3px 12px"}}>
          {value} — {t[`sl_${value}`]||""}
        </div>
        <span style={{color:"#ef4444",fontWeight:600}}>10</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:22,marginTop:4}}>
        <span>{reversed?"😢":"😄"}</span>
        <span>{reversed?"😄":"😢"}</span>
      </div>
    </div>
  );
}

function PicButtons({ options, value, onChange }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(options.length,3)},1fr)`,gap:8}}>
      {options.map((opt,i) => (
        <button key={i} onClick={()=>onChange(i)}
          style={{padding:"12px 6px",borderRadius:12,border:`2.5px solid ${value===i?"#0d9488":"#e2e8f0"}`,
            background:value===i?"#f0fdfa":"white",cursor:"pointer",fontSize:12,fontWeight:600,
            color:value===i?"#0d5c6e":"#374151",lineHeight:1.4,transition:"all 0.2s"}}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function EmojiButtons({ value, onChange, t }) {
  const emojis=["😄","🙂","😐","😟","😢"];
  const colors=["#22c55e","#84cc16","#facc15","#f97316","#ef4444"];
  return (
    <div style={{display:"flex",gap:6,justifyContent:"center"}}>
      {emojis.map((em,i) => (
        <button key={i} onClick={()=>onChange(i)}
          style={{flex:1,padding:"10px 2px",borderRadius:12,
            border:`2.5px solid ${value===i?colors[i]:"#e2e8f0"}`,
            background:value===i?`${colors[i]}15`:"white",cursor:"pointer",transition:"all 0.2s"}}>
          <div style={{fontSize:24,marginBottom:2}}>{em}</div>
          <div style={{fontSize:9,fontWeight:600,color:value===i?colors[i]:"#94a3b8"}}>{t.em_labels[i]}</div>
        </button>
      ))}
    </div>
  );
}

function InterventionGrid({ value, onChange, t }) {
  const cats=[
    {key:"therapy",icon:"🏥",label:t.int_therapy,subs:["Speech therapy","Occupational therapy","CBT","Play therapy","ABA","Counselling","Other"]},
    {key:"school",icon:"🏫",label:t.int_school,subs:["Resource room","Shadow teacher","Extra time","Special class","Other"]},
    {key:"home",icon:"🏠",label:t.int_home,subs:["Reading together","Sensory play","Motor activity","Reward chart","Outdoor play","Other"]},
    {key:"medical",icon:"💊",label:t.int_medical,subs:["New medication","Dose changed","Doctor visit","Other"]},
    {key:"none",icon:"😔",label:t.int_none,subs:["Busy","Child unwell","Forgot","Other"]},
  ];
  const [showSub,setShowSub]=useState(null);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
        {cats.map(cat=>(
          <button key={cat.key} onClick={()=>{setShowSub(cat.key);onChange({category:cat.key,activity:""});}}
            style={{padding:"10px 4px",borderRadius:12,border:`2.5px solid ${value?.category===cat.key?"#0d9488":"#e2e8f0"}`,
              background:value?.category===cat.key?"#f0fdfa":"white",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{fontSize:22,marginBottom:2}}>{cat.icon}</div>
            <div style={{fontSize:10,fontWeight:600,color:value?.category===cat.key?"#0d5c6e":"#374151",lineHeight:1.3}}>{cat.label}</div>
          </button>
        ))}
      </div>
      {showSub&&(
        <div style={{background:"#f0fdfa",borderRadius:10,padding:"10px",border:"1px solid #99f6e4"}}>
          <p style={{margin:"0 0 6px",fontSize:11,fontWeight:700,color:"#0d5c6e"}}>Which activity?</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {cats.find(c=>c.key===showSub)?.subs.map(sub=>(
              <button key={sub} onClick={()=>onChange({category:showSub,activity:sub})}
                style={{padding:"5px 10px",borderRadius:20,fontSize:11,fontWeight:600,
                  border:`1.5px solid ${value?.activity===sub?"#0d9488":"#e2e8f0"}`,
                  background:value?.activity===sub?"#0d9488":"white",
                  color:value?.activity===sub?"white":"#374151",cursor:"pointer"}}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function generateFeedback(profile, responses, lastWeek, weekNo, lang) {
  const name=profile.childName||"your child";
  const domains=profile.flaggedDomains||[];
  const prompt=`You are a warm child psychologist at CIBS Nagpur. Generate weekly feedback for parents in ${lang==="en"?"English":lang==="hi"?"Hindi":"Marathi"}.
Child: ${name}, Week: ${weekNo}/26, Domains: ${domains.join(",")||"general"}
Behaviour: ${responses.behaviour!==undefined?["Excellent","Good","Average","Difficult","Very Hard"][responses.behaviour]:"?"}
Sleep(0-10): ${responses.sleep??"?"}, Parent stress(0-10): ${responses.parentStress??"?"}
Intervention: ${responses.intervention?.activity||responses.intervention?.category||"none"}
Return ONLY JSON: {"celebration":"2 sentences praising specific positives","guidance":["activity 1","activity 2","activity 3"],"avoid":["avoid 1","avoid 2"],"reminder":"${profile.treatmentPlan||""}","parentMessage":"2 warm sentences for parent","alert":"${(responses.flag===2||responses.parentStress>=8)?"Gently suggest contacting Dr. Pangaonkar soon":""}"}`;
  try {
    const ctrl=new AbortController();
    setTimeout(()=>ctrl.abort(),15000);
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",signal:ctrl.signal,headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})
    });
    const data=await res.json();
    const txt=(data.content||[]).map(b=>b.text||"").join("");
    const clean=txt.replace(/```json|```/g,"").trim();
    return JSON.parse(clean.slice(clean.indexOf("{"),clean.lastIndexOf("}")+1));
  } catch(e) {
    return {
      celebration:`${name} completed activities this week. You are doing a wonderful job tracking progress consistently.`,
      guidance:["Read together 10 minutes daily","Praise one specific good thing every day","Take a short walk together"],
      avoid:["Avoid screens after 8pm","Avoid comparing with other children"],
      reminder:profile.treatmentPlan||"",
      parentMessage:`Every week you show up for ${name} is a gift. Your consistency is the most powerful therapy.`,
      alert:""
    };
  }
}

export default function App() {
  const [screen,setScreen]=useState("welcome");
  const [lang,setLang]=useState(getParam("lang")||"en");
  const [fileNo,setFileNo]=useState(getParam("reg")||"");
  const [dob,setDob]=useState("");
  const [profile,setProfile]=useState(null);
  const [weekNo,setWeekNo]=useState(1);
  const [lastWeek,setLastWeek]=useState({});
  const [qIndex,setQIndex]=useState(0);
  const [responses,setResponses]=useState({});
  const [feedback,setFeedback]=useState(null);
  const [error,setError]=useState("");
  const [notifGranted,setNotifGranted]=useState(false);
  const chatRef=useRef(null);
  const t=T[lang]||T.en;
  const fill=(str,name)=>(str||"").replace(/{name}/g,name||"").replace(/{n}/g,weekNo);

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTo({top:chatRef.current.scrollHeight,behavior:"smooth"});
  },[qIndex,screen]);

  useEffect(()=>{
    const name=localStorage.getItem("cibs_notif_name");
    const due=Number(localStorage.getItem("cibs_next_notif")||0);
    if(name&&Notification?.permission==="granted"&&Date.now()>=due){
      new Notification(fill(t.notifTitle,name),{body:t.notifBody,tag:"cibs-weekly"});
      localStorage.setItem("cibs_next_notif",String(Date.now()+7*24*60*60*1000));
    }
  },[]);

  const buildQuestions=(prof)=>{
    const name=prof?.childName||"";
    const flagged=prof?.flaggedDomains||[];
    const qs=[
      {id:"behaviour",type:"emoji",text:fill(t.q_behaviour,name)},
      {id:"school",type:"pic3",text:fill(t.q_school,name),options:[t.sc_yes,t.sc_partial,t.sc_no]},
      {id:"sleep",type:"slider",text:fill(t.q_sleep,name),reversed:true},
      {id:"appetite",type:"pic3",text:fill(t.q_appetite,name),options:[t.ap_good,t.ap_ok,t.ap_poor]},
    ];
    if(flagged.includes("ADHD")) qs.push({id:"attention",type:"slider",text:fill(t.q_attention,name),reversed:true});
    if(flagged.includes("MDD"))  qs.push({id:"mood",type:"slider",text:fill(t.q_mood,name)});
    if(flagged.includes("ANX"))  qs.push({id:"anxiety",type:"slider",text:fill(t.q_anxiety,name)});
    if(flagged.includes("ODD")||flagged.includes("CD")) qs.push({id:"aggression",type:"slider",text:fill(t.q_aggression,name)});
    if(flagged.includes("ASD"))  qs.push({id:"social",type:"slider",text:fill(t.q_social,name),reversed:true});
    if(flagged.includes("SLD"))  qs.push({id:"learning",type:"slider",text:fill(t.q_learning,name),reversed:true});
    if(flagged.includes("IDD"))  qs.push({id:"daily",type:"slider",text:fill(t.q_daily,name),reversed:true});
    qs.push({id:"intervention",type:"intervention",text:fill(t.q_intervention,name)});
    qs.push({id:"helped",type:"pic4",text:fill(t.q_helped,name),options:[t.h_lot,t.h_some,t.h_unsure,t.h_no]});
    qs.push({id:"parentStress",type:"slider",text:t.q_parentStress});
    qs.push({id:"flag",type:"pic3",text:t.q_flag,options:[t.f_fine,t.f_one,t.f_urgent]});
    return qs;
  };

  const requestNotif=async(name)=>{
    if(!("Notification" in window)) return;
    const perm=await Notification.requestPermission();
    if(perm==="granted"){
      setNotifGranted(true);
      localStorage.setItem("cibs_notif_name",name);
      localStorage.setItem("cibs_notif_lang",lang);
      localStorage.setItem("cibs_next_notif",String(Date.now()+7*24*60*60*1000));
    }
  };

  const fetchProfile=async()=>{
    if(!fileNo.trim()||!dob){setError("Please enter both fields.");return;}
    setScreen("loading");setError("");
    try {
      const url=`${APPS_SCRIPT_URL}?action=getRecord&reg=${encodeURIComponent(fileNo.trim())}&token=${TOKEN}`;
      const res=await fetch(url);
      const json=await res.json();
      if(json.status!=="ok") throw new Error("Not found");
      const d=json.data, P=d.P, C=d.C, V=d.V, src=P||C||{};
      const flagged=[];
      if(P){
        [["IDD","IDD"],["ADHD","ADHD"],["ASD","ASD"],["SLD","SLD"],
         ["MDD","MDD"],["ANX","Anxiety"],["ODD","ODD"],["CD","CD"]].forEach(([dom,col])=>{
          const sev=P[`${col} Severity`]||"";
          if(sev&&sev!=="Normal") flagged.push(dom);
        });
      }
      const childName=src["Child Name"]||src["Respondent Name"]||"";
      const childDob=src["Child Date of Birth"]||dob;
      const baseline=src["Timestamp"]||today();
      const prof={
        fileNo:fileNo.trim(), childName, childDob,
        age:calcAge(childDob), gender:src["Child Gender"]||"",
        school:src["School / Institution"]||"",
        flaggedDomains:flagged, riskLevel:P?.["Risk Level"]||"",
        treatmentPlan:V?.["Treatment Plan"]||"", baseline,
        weekNo:calcWeekNo(baseline),
      };
      setProfile(prof); setWeekNo(prof.weekNo);
      const url2=`${APPS_SCRIPT_URL}?action=getWeekly&reg=${encodeURIComponent(fileNo.trim())}&token=${TOKEN}`;
      const res2=await fetch(url2);
      const json2=await res2.json();
      if(json2.status==="ok"&&json2.data?.weeks?.length>0) setLastWeek(json2.data.weeks[json2.data.weeks.length-1]);
      requestNotif(childName);
      if(isBirthday(childDob)) setScreen("birthday");
      else {setScreen("chat");setQIndex(0);setResponses({});}
    } catch(e) {
      setScreen("identify");
      setError("Profile not found. Please check your Registration Number and Date of Birth.");
    }
  };

  const submitAndGenerate=async()=>{
    setScreen("generating");
    if(APPS_SCRIPT_URL&&profile){
      fetch(APPS_SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          tool:"WEEKLY",timestamp:new Date().toISOString(),fileNo:profile.fileNo,weekNo,lang,
          behaviour:responses.behaviour, school:responses.school,
          attention:responses.attention, sleep:responses.sleep,
          appetite:responses.appetite, social:responses.social,
          aggression:responses.aggression, mood:responses.mood,
          anxiety:responses.anxiety, learning:responses.learning,
          daily:responses.daily, problemVsLast:responses.flag,
          interventionCategory:responses.intervention?.category||"",
          interventionActivity:responses.intervention?.activity||"",
          interventionHelped:responses.helped,
          parentStress:responses.parentStress,
          clinicianFlag:responses.flag===2?"URGENT":responses.flag===1?"NOTE":"",
          aiFeedbackGiven:"yes",
        })
      }).catch(()=>{});
    }
    const fb=await generateFeedback(profile,responses,lastWeek,weekNo,lang);
    setFeedback(fb);setScreen("feedback");
  };

  const answer=(val)=>{
    const qs=buildQuestions(profile);
    const q=qs[qIndex];
    const newResp={...responses,[q.id]:val};
    setResponses(newResp);
    if(qIndex+1<qs.length) setTimeout(()=>setQIndex(i=>i+1),400);
    else setTimeout(()=>submitAndGenerate(),400);
  };

  const sliderVal=(id)=>responses[id]!==undefined?responses[id]:5;
  const qs=profile?buildQuestions(profile):[];
  const q=qs[qIndex];
  const pct=qs.length>0?Math.round((qIndex/qs.length)*100):0;

  const ROOT={minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0f9f8",display:"flex",flexDirection:"column"};
  const CARD={background:"white",borderRadius:16,padding:"24px 20px",maxWidth:480,width:"100%",margin:"0 auto",boxShadow:"0 4px 24px rgba(0,0,0,0.10)"};

  if(screen==="welcome") return (
    <div style={{...ROOT,alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{...CARD,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:20,background:"linear-gradient(135deg,#0d5c6e,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(13,92,110,0.3)"}}>
          <span style={{fontSize:38}}>💚</span>
        </div>
        <h1 style={{fontSize:22,fontWeight:800,color:"#0d3b47",margin:"0 0 4px"}}>{t.appName}</h1>
        <p style={{fontSize:12,color:"#64748b",margin:"0 0 20px"}}>{t.org}</p>
        <div style={{background:"#f0fdf4",borderRadius:12,padding:"16px",border:"1.5px solid #86efac",marginBottom:20,textAlign:"left"}}>
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <span style={{fontSize:28,flexShrink:0}}>👨‍⚕️</span>
            <p style={{margin:0,fontSize:13,color:"#166534",lineHeight:1.8,whiteSpace:"pre-line"}}>{t.drMessage}</p>
          </div>
          <p style={{margin:0,fontSize:11,color:"#15803d",fontStyle:"italic",whiteSpace:"pre-line",paddingLeft:38}}>{t.drSign}</p>
        </div>
        <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>{t.chooseLang}</p>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[["en","🇬🇧 English"],["hi","🇮🇳 हिंदी"],["mr","🟠 मराठी"]].map(([code,label])=>(
            <button key={code} onClick={()=>setLang(code)}
              style={{flex:1,padding:"10px 4px",borderRadius:10,border:"2px solid",fontSize:12,fontWeight:700,cursor:"pointer",
                background:lang===code?"#0d9488":"white",color:lang===code?"white":"#0d9488",borderColor:lang===code?"#0d9488":"#e2e8f0"}}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={()=>setScreen("identify")}
          style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#0d5c6e,#0d9488)",color:"white",fontSize:15,fontWeight:700,cursor:"pointer"}}>
          {t.begin}
        </button>
      </div>
    </div>
  );

  if(screen==="identify") return (
    <div style={{...ROOT,alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={CARD}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <span style={{fontSize:36}}>🔐</span>
          <h2 style={{fontSize:18,fontWeight:800,color:"#0d3b47",margin:"8px 0 4px"}}>{t.enterDetails}</h2>
        </div>
        {error&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px",marginBottom:12,fontSize:12,color:"#dc2626"}}>⚠️ {error}</div>}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>{t.fileNoLabel}</label>
          <input value={fileNo} onChange={e=>setFileNo(e.target.value)} placeholder={t.fileNoHint}
            style={{width:"100%",padding:"12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"monospace",color:"#0d3b47",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>{t.dobLabel}</label>
          <input type="date" value={dob} onChange={e=>setDob(e.target.value)} max={today()}
            style={{width:"100%",padding:"12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,color:"#0d3b47",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={fetchProfile} disabled={!fileNo.trim()||!dob}
          style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
            background:fileNo.trim()&&dob?"linear-gradient(135deg,#0d5c6e,#0d9488)":"#e2e8f0",
            color:fileNo.trim()&&dob?"white":"#94a3b8",fontSize:14,fontWeight:700,cursor:fileNo.trim()&&dob?"pointer":"not-allowed"}}>
          {t.continueBtn}
        </button>
      </div>
    </div>
  );

  if(screen==="loading"||screen==="generating") return (
    <div style={{...ROOT,alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:24}}>
        <div style={{width:60,height:60,border:"4px solid #e2e8f0",borderTopColor:"#0d9488",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 20px"}}/>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <p style={{fontSize:16,fontWeight:700,color:"#0d3b47",margin:0}}>{screen==="loading"?t.loading:t.generating}</p>
      </div>
    </div>
  );

  if(screen==="birthday"&&profile) return (
    <div style={{...ROOT,alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{...CARD,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:16}}>🎂🎉🎈</div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#dc2626",margin:"0 0 12px"}}>{fill(t.birthday,profile.childName)}</h2>
        <p style={{fontSize:15,color:"#374151",lineHeight:1.8,marginBottom:20}}>{fill(t.birthdayMsg,profile.childName)}</p>
        {profile.age&&<div style={{background:"#fef9c3",borderRadius:10,padding:"10px",border:"1.5px solid #fde047",marginBottom:20}}>
          <p style={{margin:0,fontSize:13,color:"#854d0e",fontWeight:600}}>🎊 {profile.childName} is now {profile.age+1} years old!</p>
        </div>}
        <button onClick={()=>{setScreen("chat");setQIndex(0);setResponses({});}}
          style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#dc2626,#f97316)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          {t.begin} 🎂
        </button>
      </div>
    </div>
  );

  if(screen==="chat"&&profile&&q) {
    const name=profile.childName;
    const greeting=weekNo===1?fill(t.weekGreeting[0],name):weekNo===4?fill(t.weekGreeting[2],name):weekNo>=25?fill(t.weekGreeting[4],name):weekNo>=13?fill(t.weekGreeting[3],name):fill(t.weekGreeting[1],name);
    return (
      <div style={{...ROOT}}>
        <div style={{background:"linear-gradient(135deg,#0d5c6e,#0d9488)",padding:"16px 20px",color:"white",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div>
              <p style={{margin:0,fontSize:10,opacity:0.8,textTransform:"uppercase",letterSpacing:"0.1em"}}>eSMART Weekly · {fill(t.weekLabel,"")}</p>
              <p style={{margin:0,fontSize:16,fontWeight:800}}>{name}</p>
            </div>
            <div style={{textAlign:"right",fontSize:12,opacity:0.9}}><div style={{fontWeight:700}}>Q {qIndex+1}/{qs.length}</div><div>{pct}%</div></div>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,0.3)",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:"white",borderRadius:2,transition:"width 0.5s ease"}}/>
          </div>
        </div>
        <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"16px"}}>
          {qIndex===0&&<div style={{background:"#f0fdf4",borderRadius:12,padding:"12px",marginBottom:14,border:"1px solid #86efac",display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>🌟</span>
            <p style={{margin:0,fontSize:13,color:"#166534",lineHeight:1.7}}>{greeting}</p>
          </div>}
          <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"flex-start"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#0d5c6e,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>👨‍⚕️</div>
            <div style={{background:"white",borderRadius:"4px 14px 14px 14px",padding:"12px 14px",maxWidth:"85%",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
              <p style={{margin:0,fontSize:14,color:"#1f2937",lineHeight:1.7}}>{q.text}</p>
            </div>
          </div>
          <div style={{paddingLeft:46}}>
            {q.type==="emoji"&&<EmojiButtons value={responses[q.id]} onChange={answer} t={t}/>}
            {(q.type==="pic3"||q.type==="pic4")&&<PicButtons options={q.options} value={responses[q.id]} onChange={answer}/>}
            {q.type==="slider"&&<div>
              <Slider value={sliderVal(q.id)} onChange={v=>setResponses(r=>({...r,[q.id]:v}))} reversed={q.reversed||false} t={t}/>
              <button onClick={()=>answer(sliderVal(q.id))} style={{width:"100%",marginTop:10,padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0d5c6e,#0d9488)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Next →</button>
            </div>}
            {q.type==="intervention"&&<div>
              <InterventionGrid value={responses[q.id]} onChange={v=>setResponses(r=>({...r,[q.id]:v}))} t={t}/>
              {responses[q.id]&&<button onClick={()=>answer(responses[q.id])} style={{width:"100%",marginTop:10,padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0d5c6e,#0d9488)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Next →</button>}
            </div>}
          </div>
        </div>
      </div>
    );
  }

  if(screen==="feedback"&&feedback&&profile) {
    const name=profile.childName;
    const wa=encodeURIComponent(`*${fill(t.fb_title,name)}*\n\nCIBS Nagpur · Dr. Pangaonkar · Week ${weekNo}\n\n🎉 ${feedback.celebration}\n\n💡 ${(feedback.guidance||[]).join(" | ")}\n\n💚 ${feedback.parentMessage}\n\n${REPORT_URL}?reg=${profile.fileNo}&mode=family&lang=${lang}`);
    return (
      <div style={{...ROOT}}>
        <div style={{background:"linear-gradient(135deg,#0d9488,#10b981)",padding:"16px 20px",color:"white",flexShrink:0}}>
          <p style={{margin:0,fontSize:10,opacity:0.8,textTransform:"uppercase",letterSpacing:"0.1em"}}>eSMART Weekly · CIBS Nagpur</p>
          <p style={{margin:0,fontSize:17,fontWeight:800}}>{fill(t.fb_title,name)}</p>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
          <div style={{background:"#f0fdf4",borderRadius:12,padding:"14px",marginBottom:12,border:"1.5px solid #86efac"}}>
            <p style={{margin:"0 0 6px",fontSize:13,fontWeight:800,color:"#15803d"}}>{t.fb_celebration}</p>
            <p style={{margin:0,fontSize:14,color:"#166534",lineHeight:1.8}}>{feedback.celebration}</p>
          </div>
          <div style={{background:"#eff6ff",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid #bfdbfe"}}>
            <p style={{margin:"0 0 8px",fontSize:13,fontWeight:800,color:"#1d4ed8"}}>{t.fb_guidance}</p>
            {(feedback.guidance||[]).map((g,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</div>
                <p style={{margin:0,fontSize:13,color:"#1e3a5f",lineHeight:1.7}}>{g}</p>
              </div>
            ))}
          </div>
          <div style={{background:"#fef2f2",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid #fecaca"}}>
            <p style={{margin:"0 0 6px",fontSize:13,fontWeight:800,color:"#dc2626"}}>{t.fb_avoid}</p>
            {(feedback.avoid||[]).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"flex-start"}}>
                <span style={{fontSize:12,flexShrink:0}}>🚫</span>
                <p style={{margin:0,fontSize:13,color:"#991b1b",lineHeight:1.7}}>{a}</p>
              </div>
            ))}
          </div>
          {feedback.reminder&&<div style={{background:"#fffbeb",borderRadius:12,padding:"12px",marginBottom:12,border:"1px solid #fde68a"}}>
            <p style={{margin:"0 0 4px",fontSize:13,fontWeight:800,color:"#92400e"}}>{t.fb_reminder}</p>
            <p style={{margin:0,fontSize:13,color:"#78350f",lineHeight:1.7}}>{feedback.reminder}</p>
          </div>}
          {feedback.alert&&<div style={{background:"#fef2f2",borderRadius:10,padding:"12px",marginBottom:12,border:"2px solid #ef4444"}}>
            <p style={{margin:0,fontSize:12,fontWeight:800,color:"#dc2626"}}>⚠️ {feedback.alert}</p>
          </div>}
          <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:12,padding:"16px",marginBottom:14,border:"2px solid #86efac",textAlign:"center"}}>
            <span style={{fontSize:30}}>💚</span>
            <p style={{margin:"8px 0 0",fontSize:14,color:"#15803d",lineHeight:1.8,fontStyle:"italic"}}>{feedback.parentMessage}</p>
          </div>
          <p style={{textAlign:"center",fontSize:13,color:"#94a3b8",marginBottom:16}}>{t.nextWeek}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <a href={`https://wa.me/?text=${wa}`} target="_blank" rel="noopener noreferrer"
              style={{flex:1,minWidth:100,padding:"12px",borderRadius:10,background:"#22c55e",color:"white",fontSize:12,fontWeight:700,textDecoration:"none",textAlign:"center",display:"block"}}>{t.shareBtn}</a>
            <button onClick={()=>window.print()} style={{flex:1,minWidth:100,padding:"12px",borderRadius:10,background:"#374151",color:"white",border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.saveBtn}</button>
            <a href={`${REPORT_URL}?reg=${profile.fileNo}&mode=family&lang=${lang}`} target="_blank" rel="noopener noreferrer"
              style={{flex:1,minWidth:100,padding:"12px",borderRadius:10,background:"linear-gradient(135deg,#0d5c6e,#0d9488)",color:"white",fontSize:12,fontWeight:700,textDecoration:"none",textAlign:"center",display:"block"}}>📋 Full Report</a>
          </div>
          {!notifGranted&&("Notification" in window)&&<div style={{marginTop:14,background:"#f0f9ff",borderRadius:10,padding:"12px",border:"1px solid #bae6fd",textAlign:"center"}}>
            <p style={{margin:"0 0 6px",fontSize:12,color:"#0369a1"}}>🔔 {t.notifAllow}</p>
            <button onClick={()=>requestNotif(profile.childName)} style={{padding:"8px 18px",borderRadius:8,background:"#0369a1",color:"white",border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Allow →</button>
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{...ROOT,alignItems:"center",justifyContent:"center"}}>
      <div style={{...CARD,textAlign:"center"}}>
        <div style={{width:56,height:56,border:"4px solid #e2e8f0",borderTopColor:"#0d9488",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto"}}/>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
