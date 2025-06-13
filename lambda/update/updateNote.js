const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "PUT,OPTIONS",
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
    const noteId = event.pathParameters.id;
    const { title, content } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;

    // Verify note exists and belongs to user
    const existingNote = await dynamo
      .get({
        TableName: TABLE_NAME,
        Key: { id: noteId },
      })
      .promise();

    if (!existingNote.Item || existingNote.Item.userId !== userId) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Note not found" }),
      };
    }

    const updateExpressions = [];
    const expressionAttributeValues = {};

    if (title) {
      updateExpressions.push("title = :title");
      expressionAttributeValues[":title"] = title;
    }
    if (content) {
      updateExpressions.push("content = :content");
      expressionAttributeValues[":content"] = content;
    }

    if (updateExpressions.length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "No fields to update" }),
      };
    }

    updateExpressions.push("updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const result = await dynamo
      .update({
        TableName: TABLE_NAME,
        Key: { id: noteId },
        UpdateExpression: "SET " + updateExpressions.join(", "),
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error("Error updating note:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to update note" }),
    };
  }
};
