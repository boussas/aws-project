import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { get, post, put, del } from "aws-amplify/api";
import { signOut } from "aws-amplify/auth";
import awsExports from "./aws-exports";
import {
  withAuthenticator,
  Button,
  Heading,
  TextField,
  Flex,
  Card,
  Alert,
  Divider,
  Loader,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

Amplify.configure(awsExports);

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get({
        apiName: "notesApi",
        path: "/notes",
      }).response;
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to fetch notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addOrUpdateNote() {
    if (!title || !content) {
      setError("Please enter both title and content");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const noteData = { title, content };

    try {
      if (editingNoteId) {
        const response = await put({
          apiName: "notesApi",
          path: `/notes/${editingNoteId}`,
          options: {
            body: noteData,
            headers: {
              "Content-Type": "application/json",
            },
          },
        }).response;

        await response.json();
        setSuccess("Note updated successfully!");
      } else {
        const response = await post({
          apiName: "notesApi",
          path: "/notes",
          options: {
            body: noteData,
            headers: {
              "Content-Type": "application/json",
            },
          },
        }).response;

        await response.json();
        setSuccess("Note created successfully!");
      }

      setTitle("");
      setContent("");
      setEditingNoteId(null);
      await fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(note) {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingNoteId(null);
    setTitle("");
    setContent("");
  }

  async function handleDeleteNote(id) {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await del({
        apiName: "notesApi",
        path: `/notes/${id}`,
      }).response;

      // For 204 No Content responses
      if (response.statusCode !== 204) {
        await response.json();
      }

      setSuccess("Note deleted successfully!");
      await fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
      setError("Failed to sign out. Please try again.");
    }
  }

  return (
    <div className="App">
      <Flex direction="column" gap="1rem" padding="1rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={2}>My Notes App</Heading>
          <Button onClick={handleSignOut} variation="link" size="small">
            Sign Out
          </Button>
        </Flex>

        {error && (
          <Alert variation="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variation="success" onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Card variation="outlined">
          <Heading level={4}>
            {editingNoteId ? "Edit Note" : "Create New Note"}
          </Heading>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note content"
            textarea
            rows={6}
          />
          <Flex justifyContent="flex-end" gap="0.5rem">
            {editingNoteId && (
              <Button onClick={cancelEditing} variation="link">
                Cancel
              </Button>
            )}
            <Button
              onClick={addOrUpdateNote}
              disabled={isLoading || !title || !content}
            >
              {isLoading ? (
                <Loader size="small" />
              ) : editingNoteId ? (
                "Update Note"
              ) : (
                "Add Note"
              )}
            </Button>
          </Flex>
        </Card>

        <Divider />

        <Heading level={4}>Your Notes</Heading>

        {isLoading && notes.length === 0 ? (
          <Flex justifyContent="center">
            <Loader size="large" />
          </Flex>
        ) : notes.length === 0 ? (
          <Card variation="outlined">
            <p>No notes yet. Create your first note above!</p>
          </Card>
        ) : (
          <Flex direction="column" gap="1rem">
            {notes.map((note) => (
              <Card key={note.id} variation="outlined">
                <Heading level={5}>{note.title}</Heading>
                <p style={{ whiteSpace: "pre-wrap" }}>{note.content}</p>
                <p className="note-date">
                  Created: {new Date(note.createdAt).toLocaleString()}
                  {note.updatedAt && (
                    <>
                      <br />
                      Updated: {new Date(note.updatedAt).toLocaleString()}
                    </>
                  )}
                </p>
                <Flex justifyContent="flex-end" gap="0.5rem">
                  <Button
                    size="small"
                    onClick={() => startEditing(note)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variation="destructive"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </div>
  );
}

export default withAuthenticator(App);
