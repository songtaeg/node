// express server.js
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const { Message } = require('coolsms-node-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();

app.get('/', (req, res) => {
 res.send('Hello World'); 

});

app.post('/join', async(req, res) => {
    const { id,pwd,name,mail,phone,gender }=req.body;
    var query=`INSERT INTO LOGIN(USERID,PWD,USERNAME,EMAIL,PHONE,GENDER)
                VALUES('${id}','${pwd}','${name}','${mail}','${phone}','${gender}')`;

    try{
        await connection.execute(query,[],{autoCommit:true});        
        res.json({message:"가입 완료"});
    }catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error executing query');
    }
});

app.post('/idcheck', async(req, res) => {
    const { id }=req.body;
    var query=`select count(*)as CNT from login where userid='${id}'`;
    var result=await connection.execute(query);

    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
    // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
});

app.post('/login', async(req, res) => {
    var{ id,pwd }=req.body;
    var query=`select count(*)as cnt from login where USERID ='${id}' and PWD='${pwd}' `;
    var result=await connection.execute(query);
  
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
    // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  
  });


// 서버 시작
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});