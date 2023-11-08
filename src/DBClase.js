const {Pool} = require("pg");
class DBconfig{
  constructor(config){
    this.pool = new Pool(config);
  }

  executeQuery = async(query, params)=>{
    try{
      const res = await this.pool.query(query, params);
      //console.log(sentences["getUsers"]);
      console.log(res.rows);
    }catch(e){
      console.log(e);
    }
  };

  loadDBSentences = async (path)=>{
    try{
      await this.executeQuery(sentences[path]);
    }catch(e){
      console.log(e);
    }
  }

  getCnn = async ()=>{
    try{
      return await this.pool.connect();
    }catch(e){
      console.log(e);
    }
  }

  executeClientQuery = async(cli, query) =>{
    try{
      const res = await cli.query(query);
      console.log(res.rows);
    }catch(e){
      console.log(e);
    }
  }

  returnCnn = async (cli)=>{
    try{
      await cli.release();
    }catch(e){
      console.log(e);
    }
  }

}

module.exports =  DBconfig;