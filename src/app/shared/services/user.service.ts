import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { User, SimpleUser } from '../interfaces/user';

@Injectable()
export class UserService {

    user: User;

    constructor(private http: Http) {}
    
    authenticate(user: SimpleUser): Promise<User> {
        return new Promise((resolve,reject)=>{
            this.http.post('https://www.knightsofkarma.com/api/login', user)
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
    
}