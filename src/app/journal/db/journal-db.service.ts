import { Injectable } from '@angular/core';
import { LoggerService } from '../../core/services/logger.service';
import { JournalEvents, FSDJump } from 'cmdr-journal';

@Injectable()
export class JournalDBService {
    dbPromise: Promise<IDBDatabase>;

    constructor(
        private logger: LoggerService
    ) {
        let indexedDB = window.indexedDB;
        let dbVersion = 2;

        let openRequest = indexedDB.open("journal", dbVersion);

        openRequest.onupgradeneeded = evt => {
            let upgradeDB: IDBDatabase = (<IDBOpenDBRequest>evt.target).result;

            upgradeDB.onerror = err => {
                this.logger.error({
                    originalError: err,
                    message: 'upgradeDB error'
                });
            }

            if (upgradeDB) {
                if (!upgradeDB.objectStoreNames.contains(JournalEvents.missionAccepted)) {
                    let acceptedMissionsStore = upgradeDB.createObjectStore(JournalEvents.missionAccepted, { keyPath: "MissionID" });
                    acceptedMissionsStore.createIndex("MissionID", "MissionID", { unique: true });
                }

                if (!upgradeDB.objectStoreNames.contains("completedJournalFiles")) {
                    let completedJournalFilesStore = upgradeDB.createObjectStore("completedJournalFiles", { keyPath: "filename" });
                    completedJournalFilesStore.createIndex("filename", "filename", { unique: true });
                }

                if (!upgradeDB.objectStoreNames.contains("factions")) {
                    let factionsStore = upgradeDB.createObjectStore("factions", { keyPath: "Name" });
                    factionsStore.createIndex("Name", "Name", { unique: true });
                }
            }
        }

        this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
            openRequest.onsuccess = (evt) => {
                let db = (<IDBOpenDBRequest>evt.target).result;

                db.onerror = (err: any) => {
                    this.logger.error(err);
                }

                resolve(db);
            }

            openRequest.onblocked = (block: any) => {
                this.logger.error(block);
                reject(block);
            }

            openRequest.onerror = (err: any) => {
                this.logger.error(err);
                reject(err);
            }
        });
    }

    addEntry(store: string, entry: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.dbPromise.then(db => {
                let transaction = db.transaction(store, "readwrite");

                transaction.oncomplete = (evt: any) => {
                    resolve(true);
                }

                transaction.onerror = (err: any) => {
                    this.logger.error({
                        originalError: err,
                        message: 'transaction error',
                        data: {
                            store,
                            entry
                        }
                    });
                    reject(err);
                }

                transaction.onabort = (evt: any) => {
                    this.logger.error({
                        originalError: evt,
                        message: 'transaction aborted',
                        data: {
                            store,
                            entry
                        }
                    })
                    reject(evt);
                }

                let objectStore = transaction.objectStore(store);

                let request = objectStore.add(entry);

                request.onerror = (err) => {
                    this.logger.error({ originalError: err, message: "addEntry request error" });
                }
            })
                .catch(err => {
                    this.logger.error({
                        originalError: err,
                        message: 'journalDBService.addEntry error',
                        data: {
                            store,
                            entry
                        }
                    });
                })
        })
    }

    getEntry<T>(store: string, key: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.dbPromise.then(db => {
                let transaction = db.transaction(store, "readonly");
                let objectStore = transaction.objectStore(store);
                let request = objectStore.get(key)

                request.onsuccess = (evt) => {
                    resolve((<IDBRequest>evt.target).result);
                }

                request.onerror = (err) => {
                    this.logger.error({
                        originalError: err,
                        message: 'journalDBService.getEntry request error',
                        data: {
                            store,
                            key
                        }
                    });
                }
            })
                .catch(err => {
                    let report = {
                        originalError: err,
                        message: 'journalDBService.getEntry error',
                        data: {
                            store,
                            key
                        }
                    };
                })
        })
    }

    getAll<T>(store: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.dbPromise.then(db => {
                let transaction = db.transaction(store, "readonly");
                let objectStore = transaction.objectStore(store);
                let request = objectStore.openCursor();

                let results: T[] = [];
                request.onsuccess = evt => {
                    let cursor: IDBCursorWithValue = (<IDBRequest>event.target).result;

                    if (cursor) {
                        cursor.continue();
                        results.push(cursor.value);
                    } else {
                        resolve(results);
                    }
                }

                request.onerror = err => {
                    this.logger.error({
                        originalError: err,
                        message: "Error in getAll transaction"
                    })
                    reject(err);
                }
            })
        })
    }
}