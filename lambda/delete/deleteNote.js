const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "DELETE,OPTIONS",
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

    await dynamo
      .delete({
        TableName: TABLE_NAME,
        Key: { id: noteId },
      })
      .promise();

    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  } catch (error) {
    console.error("Error deleting note:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to delete note" }),
    };
  }
};
