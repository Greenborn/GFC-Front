import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProfileContest } from '../models/profile_contest';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileContestService extends ApiService<ProfileContest> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('profile-contest', http, config)
   }

   get template(): ProfileContest {
    return {
      id: undefined,
      profile_id: undefined,
      contest_id: undefined,
    }
  }}
