import { Injectable } from '@angular/core';
import { LoggerService } from '../../core/services/logger.service';
import { JournalEvents } from 'cmdr-journal';

@Injectable()
export class JournalDBService {
    dbPromise: Promise<IDBDatabase>;

    constructor(
        private logger: LoggerService
    ) {
        let indexedDB = window.indexedDB;
        let dbVersion = 1;

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
                    this.logger.error({originalError: err, message:"addEntry request error"});
                }
            })
            .catch(err=>{
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

    getEntry(store: string, key:any): Promise<any> {
        return new Promise<any>((resolve,reject)=>{
            this.dbPromise.then(db=>{
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
            .catch(err=>{
                let report = {
                    originalError: err,
                    message: 'journalDBService.addEntry error',
                    data: {
                        store,
                        key
                    }
                };
            })
        })
    }
}