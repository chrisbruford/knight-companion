import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { User, SimpleUser } from '../../shared/interfaces/user';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {

    user: User;

    constructor(private http: Http) {}
    
    authenticate(user: SimpleUser): Promise<User> {
        return new Promise((resolve,reject)=>{
            let data = Object.assign({remember: true}, user);
            this.http.post(`${process.env.API_ENDPOINT}/login`, data)
            .toPromise()
            .then(res => res.json())
            .then(data=>{
                if (data) {
                    this.user = data;
                    resolve(data);
                } else {
                    reject(null);
                }
            })
            .catch(err=>reject(err));
        });
    }

    authCheck() {
        return this.http.get(`${process.env.API_ENDPOINT}/authcheck`)
            .map(res=>res.json());
    }
    
}