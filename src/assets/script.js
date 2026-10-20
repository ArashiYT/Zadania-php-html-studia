
// @ts-check

/** @typedef { { folder: string, file: string | null, url: string | null }} Item */
/** @typedef { { type: 'success', data: Item[] } | { type: 'error', message: string } } FetchResult */

import { shortenString, tryCatch } from '../globals.js';

// DocumentList class to manage the list of documents and the preview iframe
class DocumentList {
    /** @type {HTMLUListElement} */
    _listElement;

    /** @type {HTMLIFrameElement} */
    _previewElement;

    /** @type {HTMLAnchorElement} */
    _goButton;

    /** 
     * @param {HTMLIFrameElement | null} previewElement 
     * @param {HTMLUListElement | null} listElement 
     * @param {HTMLAnchorElement | null} goButton 
     * */
    constructor(previewElement, listElement, goButton) {
        if(!previewElement || !listElement || !goButton) throw new Error('Required elements not found in the DOM');

        this._previewElement = previewElement;
        this._listElement = listElement;
        this._goButton = goButton;
    }

    /** @param {Item} item */
    _createListItem(item) {
        const li = document.createElement('li');
        li.textContent =  item.folder + (item.file ? ' → ' + shortenString(item.file, 10) : ' [empty]');
        this._listElement.appendChild(li);

        if(item.url) {
            const url = item.url;
            li.addEventListener('click', () => this._handleListItemClick(li, url));
        }   
        
    }

    /** 
     * @param {string} url 
     * @param {HTMLLIElement} li 
     * @returns {void}
     * */
    _handleListItemClick(li, url) {
        const activeLi = this._listElement.querySelector('li.active');

        if(activeLi) activeLi.classList.remove('active'); 
        li.classList.add('active');

        this._previewElement.src = url;
        this._goButton.href = url
        
    }

    /** @param {Item[]} items */
    _populateList(items) {
        this._listElement.innerHTML = '';
        items.forEach(item => {
            this._createListItem(item);
        });
    }

    /** @returns {Promise<FetchResult>} */
    _fetchData() {
        return tryCatch(async () => {
            const response = await fetch('../api.php');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        });
    }

    /** 
     * @param {FetchResult} result  - result from the fetch operation
     * @returns {result is {type: 'error', message: string}} - type guard to check if the result is an error
     * */
    _checkError(result) {
        if(result.type === 'error') {
            this._listElement.innerHTML = `<li>Error: ${result.message}</li>`;
            return true;
        }
        return false;
    }


    // Load the data and populate the list
    load() {
        this._fetchData().then(result => {
            if (!this._checkError(result)) {
                this._populateList(result.data);
                
                const firstItem = this._listElement.querySelector('li');
                if (firstItem) firstItem.click();
            }

        });
    }
}

/** @type {HTMLUListElement | null} */
const list = document.querySelector('#list');

/** @type {HTMLIFrameElement | null} */
const preview = document.querySelector('#preview');

/** @type {HTMLAnchorElement | null} */
const goButton = document.querySelector('#go');

const documentList = Object.freeze(
    new DocumentList(preview, list, goButton)
);

documentList.load();