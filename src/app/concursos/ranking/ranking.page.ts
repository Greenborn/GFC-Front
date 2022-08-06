import { Component, OnInit } from '@angular/core';

import { RankingService } from '../../services/ranking.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
})
export class RankingPage implements OnInit {

  constructor(
   private rankingService: RankingService
  ) { 
    this.cargarRanking()
  }

  public ranking:any = {}
  public sentido_orden:number = -1

  async ngOnInit() {
    
  }
 
  cargarRanking() {
    this.rankingService.getAll().subscribe(r => {
      this.ranking = r
      this.ranking.profiles = this.ranking.profiles.sort(
        (item1, item2) => {
          if (item1.score < item2.score ) {
            return -1 * this.sentido_orden;
          }
          if (item1.score > item2.score) {
            return 1 * this.sentido_orden;
          }
          return 0;
        })

      this.ranking.fotoclubs = this.ranking.fotoclubs.sort(
        (item1, item2) => {
          if (item1.score < item2.score ) {
            return -1 * this.sentido_orden;
          }
          if (item1.score > item2.score) {
            return 1 * this.sentido_orden;
          }
          return 0;
        }) 
    })
  }
}
