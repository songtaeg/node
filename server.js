const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
app.use(cors());
app.use(express.json());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

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

// 엔드포인트
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/list', async (req, res) => {
  const{keyword,grade}=req.query;
  try {
    const result = await connection.execute(`SELECT * FROM STUDENT 
      WHERE (STU_NAME LIKE '%${keyword}%' or STU_NO LIKE '%${keyword}%')
      and STU_GRADE like'%${grade}%'`);
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
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/delete', async (req, res) => {
  const{ stuNo }=req.query;
  try {
    await connection.execute(
      `DELETE FROM STUDENT WHERE STU_NO ='${stuNo}'`,[],{autoCommit:true}
    );
    res.json([{message:"삭제 완료"}]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/search', async (req, res) => {
  const { id } = req.query;
  try {
    const result = await connection.execute(`SELECT * FROM STUDENT WHERE STU_NO LIKE= '%${id}%'`);
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
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/update', async (req, res) => {
  const{ stuNo,stuName,stuDept,stuGrade,stuGender }=req.query;
  var query=`UPDATE 
            STUDENT SET 
              STU_NAME='${stuName}',
              STU_DEPT='${stuDept}',
              STU_GRADE='${stuGrade}',
              STU_GENDER='${stuGender}'
            WHERE STU_NO='${stuNo}' `;
  //console.log(query);          
  try {
    await connection.execute(query,[],{autoCommit:true} );

    res.json([{message:"수정 완료"}]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// app.get('/idCheck', async (req, res) => {
//   var { stuNo } = req.query;
//   var query = `SELECT COUNT(*) AS CNT FROM STUDENT WHERE STU_NO = ${stuNo}`;
//   const result = await connection.execute(query);

//   const columnNames = result.metaData.map(column => column.name);
//   // 쿼리 결과를 JSON 형태로 변환
//   const rows = result.rows.map(row => {
//     // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
//     const obj = {};
//     columnNames.forEach((columnName, index) => {
//       obj[columnName] = row[index];
//     });
//     return obj;
//   });

//   res.json(rows);
// });

//예시
app.get('/qwer', async (req, res) => {
  const{ stuNo,stuGrade }=req.query;
  var query=`UPDATE STUDENT SET STU_GRADE='${stuGrade}'WHERE STU_NO=${stuNo} `;         
  await connection.execute(query,[],{autoCommit:true} );
  res.json({message:"수정 완료"});  
});

app.get('/stu-delete', async (req, res) => {
  const{ stuNo }=req.query;
  var query=`DELETE FROM STUDENT WHERE STU_NO ='${stuNo}'`;
  console.log(query);
  await connection.execute(query,[],{autoCommit:true} );
  res.json({message:"삭제 완료"});
});

// app.get('/insert', async (req, res) => {
//   const{ stuNo,stuName,stuDept,stuGrade,stuGender }=req.query;
//   var query=`INSERT 
//             INTO STUDENT(STU_NO,STU_NAME,STU_DEPT,STU_GRADE,STU_GENDER) 
//             VALUES('${stuNo}','${stuName}','${stuDept}','${stuGrade}','${stuGender}')`;
//   console.log(query);          
//   try {
//     await connection.execute(query,[],{autoCommit:true} );

//     res.json([{message:"입력 완료"}]);
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).send('Error executing query');
//   }
// });

app.post('/insert', async (req, res) => {
  var { stuNo,stuName,stuDept,stuGrade,stuGender }=req.body;
  var query=`INSERT INTO STUDENT(STU_NO, STU_NAME, STU_DEPT,STU_GRADE,STU_GENDER) 
            VALUES('${stuNo}','${stuName}','${stuDept}','${stuGrade}','${stuGender}')`;

  await connection.execute(query,[],{autoCommit:true});
  res.json({message:"추가 완료"});
});

app.get('/idcheck',  async(req, res) => {
  const { stuNo }=req.query;
  var query=`SELECT COUNT(STU_NO) AS CNT FROM STUDENT WHERE STU_NO='${stuNo}'`;
  await connection.execute(query,[],{autoCommit:true});
  res.json({message:"중복된 학번이 있습니다"});
});

app.get('/plus',  async(req, res) => {
  const { stuNo,stuName,stuDept }=req.query;
  var query=`INSERT INTO STUDENT(STU_NO, STU_NAME, STU_DEPT)
            VALUES('${stuNo}','${stuName}','${stuDept}')`;
  await connection.execute(query,[],{autoCommit:true});
  res.json({message:"추가되었습니다"});
});

app.post('/login', async(req, res) => {
  var{ id,pwd }=req.body;
  var query=`select count(*)as cnt from member where ID= '${id}' and PWD='${pwd}' `;
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
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
