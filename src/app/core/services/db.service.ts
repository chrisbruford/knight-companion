import { Injectable, OnDestroy } from '@angular/core';
import { LoggerService } from './logger.service';
import { JournalEvents, FSDJump } from 'cmdr-journal/dist';
import { AppErrorService } from './app-error.service';
import { DBStore } from '../enums/db-stores.enum';
import { UserService } from './user.service';
import { switchMap, filter, take, takeWhile } from '../../../../node_modules/rxjs/operators';
import { Observable, BehaviorSubject } from '../../../../node_modules/rxjs';

@Injectable({
    providedIn: 'root'
})
export class DBService implements OnDestroy {
    private db: BehaviorSubject<IDBDatabase>;
    private alive = true;

    constructor(
        private logger: LoggerService,
        private errorService: AppErrorService,
        private userService: UserService
    ) {
        let indexedDB = window.indexedDB;
        let dbVersion = 1;
        let openRequest: IDBOpenDBRequest;
        this.db = new BehaviorSubject(null);

        this.userService.user.pipe(
            filter(user => user !== null),
            takeWhile(()=>this.alive)
        )
            .subscribe(user => {
                openRequest = indexedDB.open(`journal-${user.username.toLowerCase()}`, dbVersion);
                openRequest.onupgradeneeded = evt => {
                    let upgradeDB: IDBDatabase = (<IDBOpenDBRequest>evt.target).result;

                    upgradeDB.onerror = err => {
                        this.logger.error({
                            originalError: err,
                            message: 'upgradeDB error'
                        });
                    }

                    if (upgradeDB) {
                        if (!upgradeDB.objectStoreNames.contains(DBStore.missionAccepted)) {
                            let acceptedMissionsStore = upgradeDB.createObjectStore(DBStore.missionAccepted, { keyPath: "MissionID" });
                            acceptedMissionsStore.createIndex("MissionID", "MissionID", { unique: true });
                        }

                        if (!upgradeDB.objectStoreNames.contains(DBStore.completedJournalFiles)) {
                            let completedJournalFilesStore = upgradeDB.createObjectStore(DBStore.completedJournalFiles, { keyPath: "filename" });
                            completedJournalFilesStore.createIndex("filename", "filename", { unique: true });
                        }

                        if (!upgradeDB.objectStoreNames.contains(DBStore.factions)) {
                            let factionsStore = upgradeDB.createObjectStore(DBStore.factions, { keyPath: "Name" });
                            factionsStore.createIndex("Name", "Name", { unique: true });
                        }

                        if (!upgradeDB.objectStoreNames.contains(DBStore.currentState)) {
                            let currentStateStore = upgradeDB.createObjectStore(DBStore.currentState, { keyPath: "key" });
                            currentStateStore.createIndex("key", "key", { unique: true });
                        }

                        if (!upgradeDB.objectStoreNames.contains(DBStore.ships)) {
                            let shipsStore = upgradeDB.createObjectStore(DBStore.ships, { keyPath: "ShipID" });
                            shipsStore.createIndex("ShipID", "ShipID", { unique: true });
                        }

                        if (!upgradeDB.objectStoreNames.contains(DBStore.materials)) {
                            let materialsStore = upgradeDB.createObjectStore(DBStore.materials, { keyPath: "Name" });
                            materialsStore.createIndex("Name", "Name", { unique: true });
                        }

                        if (!upgradeDB.objectStoreNames.contains(DBStore.appSettings)) {
                            let currentStateStore = upgradeDB.createObjectStore(DBStore.appSettings, { keyPath: "key" });
                            currentStateStore.createIndex("key", "key", { unique: true });
                        }
                    }
                }

                openRequest.onsuccess = (evt) => {
                    let db = (<IDBOpenDBRequest>evt.target).result;
                    this.errorService.removeError('dbFail');

                    db.onerror = (err: any) => {
                        this.db.error(err);
                    }

                    this.db.next(db);
                }

                openRequest.onblocked = (block: any) => {
                    this.db.error(block);
                }

                openRequest.onerror = (originalError: any) => {
                    this.logger.error({ originalError, message: "Unrecoverable error opening initial DB" });
                    this.errorService.addError('dbFail', { message: 'An internal database error has occured. This app may not function as intended.' });
                    this.db.error(originalError);
                }
            });
    }

    putCurrentState(entry: { key: string, value: any }): Promise<boolean> {
        let store = "currentState"

        return new Promise<boolean>((resolve, reject) => {
            this.db.pipe(
                filter(db => db !== null),
                take(1)
            )
                .subscribe(
                    db => {
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
                    },
                    err => {
                        this.logger.error({
                            originalError: err,
                            message: 'journalDBService.putCurrentState error',
                            data: {
                                store,
                                entry
                            }
                        });
                    }
                )

        })
    }

    addEntry(store: string, entry: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.db.pipe(
                filter(db => db !== null),
                take(1)
            )
                .subscribe(db => {
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

                    request.onerror = originalError => {
                        reject({ originalError, message: "addEntry request error", data: entry });
                    }
                },
                    err => {
                        this.logger.error({
                            originalError: err,
                            message: 'journalDBService.addEntry error',
                            data: {
                                store,
                                entry
                            }
                        });
                    }
                )

        })
    }

    putEntry(store: string, entry: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.db.pipe(
                filter(db => db !== null),
                take(1)
            )
                .subscribe(db => {
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
                        reject({ originalError: err, message: "putEntry request error" });
                    }
                },
                    err => {
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

    deleteEntry(store: string, key: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.db.pipe(
                filter(db => db !== null),
                take(1)
            )
                .subscribe(db => {
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
                                key
                            }
                        });
                    }

                    transaction.onabort = (evt: any) => {
                        reject({
                            originalError: evt,
                            message: 'transaction aborted',
                            data: {
                                store,
                                key
                            }
                        })
                    }

                    let objectStore = transaction.objectStore(store);

                    let request = objectStore.delete(key);

                    request.onerror = (err) => {
                        reject({ originalError: err, message: "putEntry request error" });
                    }
                },
                    err => {
                        this.logger.error({
                            originalError: err,
                            message: 'journalDBService.addEntry error',
                            data: {
                                store,
                                key
                            }
                        });
                    })
        })
    }

    getEntry<T>(store: string, key: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.db
                .pipe(
                    filter(db => db !== null),
                    take(1)
                )
                .subscribe(db => {
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
                },
                    err => {
                        this.logger.error({
                            originalError: err,
                            message: 'journalDBService.addEntry error',
                            data: {
                                store,
                                key
                            }
                        });
                    })
        })
    }

    getAll<T>(store: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.db.pipe(
                filter(db => db !== null),
                take(1)
            )
                .subscribe(db => {
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
                },
                    err => {
                        this.logger.error({
                            originalError: err,
                            message: 'journalDBService.addEntry error',
                            data: {
                                store
                            }
                        });
                    })
        })
    }

    ngOnDestroy() {
        this.alive = false;
    }
}