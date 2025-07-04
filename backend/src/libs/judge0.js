import axios from "axios"

export const getJudge0LanguageId=(language)=>{
  const languageMap = {
    "PYTHON":71,
    "JAVA":62,
    "JAVASCRIPT":63,
};
return languageMap[language];

}

export const getLanguage = (language_id)=>{
  const language = {
      71:"PYTHON",
      62:"JAVA",
      63:"JAVASCRIPT",
  }
  return language[language_id] || "Unknown"
}
export const submitBatch =async (submissions)=>{
  const {data} =await axios.post(`${process.env.JUDGE_URL}/submissions/batch?base64_encoded=false`,
  {
    submissions
  }
);
  return data // it will be array of multiple object token 
}


const sleep  = (ms)=> new Promise((resolve)=> setTimeout(resolve , ms))

export const pollBatchResults = async (tokens)=>{
    while(true){
        
        const {data} = await axios.get(`${process.env.JUDGE_URL}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            }
        })

        const results = data.submissions;

        const isAllDone = results.every(
            (r)=> r.status.id !== 1 && r.status.id !== 2
        )

        if(isAllDone) return results
        await sleep(1000)
    }
}