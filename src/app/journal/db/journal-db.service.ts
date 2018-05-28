import { Injectable } from '@angular/core';
import { LoggerService } from '../../core/services/logger.service';
import { JournalEvents, FSDJump } from 'cmdr-journal';
import { AppErrorService } from '../../core/services/app-error.service';

@Injectable()
export class JournalDBService {
    dbPromise: Promise<IDBDatabase>;

    constructor(
        private logger: LoggerService,
        private errorService: AppErrorService
    ) {
        let indexedDB = window.indexedDB;
        let dbVersion = 3;

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

                if (!upgradeDB.objectStoreNames.contains("currentState")) {
                    let currentStateStore = upgradeDB.createObjectStore("currentState", {keyPath: "key"});
                    currentStateStore.createIndex("key","key",{unique: true});
                }
            }
        }

        this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
            openRequest.onsuccess = (evt) => {
                let db = (<IDBOpenDBRequest>evt.target).result;
                this.errorService.removeError('dbFail');

                db.onerror = (err: any) => {
                    reject(err);
                }

                resolve(db);
            }

            openRequest.onblocked = (block: any) => {
                reject(block);
            }

            openRequest.onerror = (originalError: any) => {
                this.logger.error({originalError, message: "Unrecoverable error opening initial DB"});
                this.errorService.addError('dbFail', {message: 'An internal database error has occured. This app may not function as intended.'});
                reject(originalError);
            }
        });
    }

    putCurrentState(entry: {key: string, value: any}): Promise<boolean> {
        let store = "currentState"

        return new Promise<boolean>((resolve, reject) => {
            this.dbPromise.then(db => {
                let transaction = db.transaction(store, "readwrite");

                transaction.oncomplete = (evt: any) => {
                    resolve(true);
                }

                transaction.onerror = (err: any) => {
                    reject({
                        originalError: err,
                        message: 'transaction error',
                        data: {
                            store,
                            entry
                        }
                    });
                }

                transaction.onabort = (evt: any) => {
                    reject({
                        originalError: evt,
                        message: 'transaction aborted',
                        data: {
                            store,
                            entry
                        }
                    })
                }

                let objectStore = transaction.objectStore(store);

                let request = objectStore.put(entry);

                request.onerror = (err) => {
                    reject({ originalError: err, message: "putCurrentState request error" });
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

    addEntry(store: string, entry: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.dbPromise.then(db => {
                let transaction = db.transaction(store, "readwrite");

                transaction.oncomplete = (evt: any) => {
                    resolve(true);
                }

                transaction.onerror = (err: any) => {
                    reject({
                        originalError: err,
                        message: 'transaction error',
                        data: {
                            store,
                            entry
                        }
                    });
                }

                transaction.onabort = (evt: any) => {
                    reject({
                        originalError: evt,
                        message: 'transaction aborted',
                        data: {
                            store,
                            entry
                        }
                    })
                }

                let objectStore = transaction.objectStore(store);

                let request = objectStore.add(entry);

                request.onerror = (err) => {
                    reject({ originalError: err, message: "addEntry request error" });
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
                    reject({
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
                    reject({
                        originalError: err,
                        message: "Error in getAll transaction"
                    })
                }
            })
        })
    }
}