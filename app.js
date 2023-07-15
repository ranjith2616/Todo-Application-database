const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dpPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializationServerAndDB = async () => {
  try {
    db = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running Server at http://3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};

initializationServerAndDB();

// Inserting Values to todo table API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;

  const postDetails = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );
    `;
  let repo = await db.run(postDetails);
  response.send("Todo Successfully Added");
});

// API 1 GET Method Returns a list of all todos whose status is 'TO DO'
app.get("/todos/", async (request, response) => {
  const { status = "%20", priority = "%20", search_q = "%20" } = request.query;

  const getDetails = `
    SELECT * 
    FROM 
    todo
    WHERE 
    status LIKE '%${status}%' or
    priority LIKE '%${priority}%' or
    todo LIKE '%${search_q}%';
    
    `;
  let dbResponse = await db.all(getDetails);
  //console.log(dbResponse);
  response.send(dbResponse);
});

// API 2 GET Method Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoDetails = `
    SELECT * FROM todo WHERE id = ${todoId};
    `;

  const dbResponse = await db.get(getTodoDetails);
  response.send(dbResponse);
  //console.log(dbResponse);
});

// API 4 PUT Method Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;

  let updatedCol = "";

  switch (true) {
    case todoDetails.status !== undefined:
      updatedCol = "Status";
      break;
    case todoDetails.priority !== undefined:
      updatedCol = "Priority";
      break;
    case todoDetails.todo !== undefined:
      updatedCol = "Todo";
      break;
  }

  const getQuery = `
    SELECT * FROM todo WHERE id = ${todoId};
    `;
  let previousTodo = await db.get(getQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateQuery = `
  UPDATE todo 
  SET 
  todo = '${todo}',
  priority = '${priority}',
  status = '${status}'
  WHERE id = ${todoId};
  `;
  await db.run(updateQuery);
  response.send(`${updatedCol} Updated`);
});

// API 5 DELETE Method
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteQuery = `
    DELETE FROM todo WHERE id = ${todoId};
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
