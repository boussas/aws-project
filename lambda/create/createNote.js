const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  try {
    const { title, content } = JSON.parse(event.body);
    if (!title || !content) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "title and content are required" }),
      };
    }

    const userId = event.requestContext.authorizer.claims.sub;
    const note = {
      id: uuidv4(),
      title,
      content,
      userId,
      createdAt: new Date().toISOString(),
    };

    await dynamo
      .put({
        TableName: TABLE_NAME,
        Item: note,
      })
      .promise();

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(note),
    };
  } catch (error) {
    console.error("Error creating note:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to create note" }),
    };
  }
};
