document.addEventListener('DOMContentLoaded', function () {
    const noteForm = document.getElementById('noteForm');
    const noteTitleInput = document.getElementById('noteTitleInput'); // Updated ID for note title input
    const noteContentInput = document.getElementById('noteContent');
    const actionItemInput = document.getElementById('actionItemInput');
    const actionItemList = document.getElementById('actionItemList');
    const notesContainer = document.getElementById('notesContainer');
    let editingNote = null; // Variable to keep track of the note being edited

    // Load notes from JSON file
    loadNotesFromJSON();

    noteForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (editingNote) {
            // If editing a note, update it
            updateNote();
        } else {
            // Otherwise, add a new note
            addNote();
        }
    });

    document.getElementById('addActionItem').addEventListener('click', function (event) {
        event.preventDefault();
        addActionItem();
    });

    // Add event listener to the "Create Note" button
    document.getElementById('createNoteButton').addEventListener('click', createNoteCard);

    function addNote() {
        const noteTitle = noteTitleInput.value.trim();
        const noteContent = noteContentInput.value.trim();
        const actionItems = Array.from(actionItemList.children).map(item => ({
            text: item.querySelector('span').textContent.trim(),
            completed: item.querySelector('input').checked
        }));

        if (noteTitle !== '' && noteContent !== '') {
            const noteElement = createNoteElement(noteTitle, noteContent, actionItems);

            notesContainer.appendChild(noteElement);

            // Clear the input
            noteTitleInput.value = '';
            noteContentInput.value = '';
            actionItemInput.value = '';
            actionItemList.innerHTML = '';

            // Update local storage
            updateLocalStorage();
        }
    }
    function updateNote(onClickFunction) {
        const noteTitle = noteTitleInput.value.trim();
        const noteContent = noteContentInput.value.trim();
        const actionItems = Array.from(actionItemList.children).map(item => ({
            text: item.querySelector('span').textContent.trim(),
            completed: item.querySelector('input').checked
        }));
    
        if (noteTitle !== '' && noteContent !== '') {
            const noteElement = createNoteElement(noteTitle, noteContent, actionItems);
    
            notesContainer.replaceChild(noteElement, editingNote);
            editingNote = null;
    
            // Clear the input
            noteTitleInput.value = '';
            noteContentInput.value = '';
            actionItemInput.value = '';
            actionItemList.innerHTML = '';
    
            // Update local storage
            updateLocalStorage();
            
        }
    }
    

    function addActionItem() {
        const actionItemText = actionItemInput.value.trim();

        if (actionItemText !== '') {
            const actionItemElement = document.createElement('li');
            actionItemElement.innerHTML = `<input type="checkbox" onchange="toggleActionCompletion(this)"><span>${actionItemText}</span>`;
            actionItemList.appendChild(actionItemElement);
            actionItemInput.value = '';
        }
    }

    function toggleActionCompletion(checkbox) {
        const actionItemText = checkbox.nextSibling.textContent.trim();
        const noteElement = checkbox.closest('.note-content');
        const actionItem = Array.from(noteElement.querySelector('.action-items').children).find(item => item.querySelector('span').textContent.trim() === actionItemText);

        if (actionItem) {
            actionItem.querySelector('input').checked = checkbox.checked;
            updateLocalStorage();
        }
    }

    function editNote() {
        // Set the editingNote variable to the parent note element
        editingNote = this.closest('.note');

        // Extract note details for editing
        const noteTitle = editingNote.querySelector('h3').textContent;
        const noteContent = editingNote.querySelector('p').textContent;
        const actionItems = Array.from(editingNote.querySelector('.action-items').children).map(item => ({
            text: item.querySelector('span').textContent.trim(),
            completed: item.querySelector('input').checked
        }));

        // Populate the form with the note details for editing
        noteTitleInput.value = noteTitle;
        noteContentInput.value = noteContent;
        actionItems.forEach(item => {
            const actionItemElement = document.createElement('li');
            actionItemElement.innerHTML = `<input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleActionCompletion(this)"><span>${item.text}</span>`;
            actionItemList.appendChild(actionItemElement);
        });

        // Scroll to the top of the form for better visibility
        noteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function createNoteCard() {
        // Create an editable card for the new note
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card', 'editable');

        noteCard.innerHTML = `<div class="note-content">
                                <h3 contenteditable="true" placeholder="Enter title"></h3>
                                <p contenteditable="true" class="truncated" placeholder="Enter content"></p>
                                <ul class="action-items" contenteditable="true">
                                    <li><input type="checkbox"><span placeholder="Action item"></span></li>
                                </ul>
                            </div>
                            <button class="save-button">Save</button>
                            <button class="cancel-button">Cancel</button>`;

        // Add event listeners to the save and cancel buttons
        noteCard.querySelector('.save-button').addEventListener('click', saveNewNote);
        noteCard.querySelector('.cancel-button').addEventListener('click', cancelNewNote);

        // Add the editable card to the notesContainer
        notesContainer.appendChild(noteCard);

        // Scroll to the newly created card for better visibility
        noteCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function saveNewNote() {
        // Extract note details from the editable card
        const noteTitle = notesContainer.querySelector('.editable h3').textContent.trim();
        const noteContent = notesContainer.querySelector('.editable p').textContent.trim();
        const actionItems = Array.from(notesContainer.querySelector('.editable .action-items').children).map(item => ({
            text: item.querySelector('span').textContent.trim(),
            completed: item.querySelector('input').checked
        }));

        if (noteTitle !== '' && noteContent !== '') {
            // Create a new note element with the extracted details
            const noteElement = createNoteElement(noteTitle, noteContent, actionItems);

            // Remove the editable card and add the new note to notesContainer
            notesContainer.removeChild(notesContainer.querySelector('.editable'));
            notesContainer.appendChild(noteElement);

            // Update local storage
            updateLocalStorage();
        }
    }

    function cancelNewNote() {
        // Remove the editable card without saving
        notesContainer.removeChild(notesContainer.querySelector('.editable'));
    }

    function createNoteElement(title, content, actionItems) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');

        noteElement.appendChild(createNoteContentElement(title, content, actionItems));

        // Add event listener to expand note content
        noteElement.addEventListener('click', function (event) {
            if (event.target.classList.contains('delete-button')) {
                // If the delete button is clicked, remove the note
                notesContainer.removeChild(noteElement);
                updateLocalStorage();
            } else {
                // Otherwise, toggle the expanded class
                noteElement.classList.toggle('expanded');
            }
        });

        // Add event listener to edit note
        noteElement.addEventListener('dblclick', editNote);

        return noteElement;
    }

    function createNoteContentElement(title, content, actionItems) {
        const noteContentElement = document.createElement('div');
        noteContentElement.classList.add('note-content');

        const creationDate = new Date().toLocaleString();

        noteContentElement.innerHTML = `<h3>${title}</h3>
                                        <p class="truncated">${truncateText(content, 10)}</p>
                                        <small>Created on: ${creationDate}</small>
                                        <ul class="action-items">${actionItems.map(item => `<li><input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleActionCompletion(this)"><span>${item.text}</span></li>`).join('')}</ul>`;

        return noteContentElement;
    }

    function truncateText(text, maxWords) {
        const words = text.split(' ');
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(' ') + '...';
        }
        return text;
    }

    function updateLocalStorage() {
        const notes = Array.from(notesContainer.children).map(noteElement => {
            const noteContentElement = noteElement.querySelector('.note-content');
            const actionItems = Array.from(noteContentElement.querySelector('.action-items').children).map(item => ({
                text: item.querySelector('span').textContent.trim(),
                completed: item.querySelector('input').checked
            }));

            return {
                title: noteContentElement.querySelector('h3').textContent,
                content: noteContentElement.querySelector('p').textContent,
                creationDate: noteContentElement.querySelector('small').textContent.replace('Created on: ', ''),
                actionItems: actionItems
            };
        });

        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function loadNotesFromJSON() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'notes.json', true);

        xhr.onload = function () {
            if (xhr.status === 200) {
                const notes = JSON.parse(xhr.responseText);

                notes.forEach(note => {
                    const noteElement = createNoteElement(note.title, note.content, note.actionItems);

                    notesContainer.appendChild(noteElement);
                });
            } else {
                console.error('Failed to fetch notes from JSON file.');
            }
        };

        xhr.send();
    }
});