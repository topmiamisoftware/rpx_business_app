import {NgxsDataEntityCollectionsRepository} from '@angular-ru/ngxs/repositories';
import {RecentGuest} from '../models';
import {Computed, StateRepository} from '@angular-ru/ngxs/decorators';
import {Injectable} from '@angular/core';
import {State} from '@ngxs/store';
import {createEntityCollections} from '@angular-ru/cdk/entity';
import {Observable, tap} from 'rxjs';
import {CustomerManagerService} from '../customer-manager.service';
import {SortOrderType} from "@angular-ru/cdk/typings";

@StateRepository()
@State({
  name: 'recent_guests',
  defaults: {
    ...createEntityCollections(),
    pagedData: {
      current_page: 1,
      total: 0,
      per_page: 20,
      last_page: 0,
    },
  },
})
@Injectable()
export class RecentGuestsEntitiesState extends NgxsDataEntityCollectionsRepository<RecentGuest> {
  constructor(private customerManagementService: CustomerManagerService) {
    super();
  }

  ngxsOnInit() {
    this.reset();
  }

  @Computed()
  get recentGuests$(): Observable<RecentGuest[]> {
    return this.entitiesArray$;
  }

  getRecentGuestList() {
    return this.customerManagementService.getRecentGuestList().pipe(
      tap(
        (response: {
          data: RecentGuest[];
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        }) => {
          console.log('recent guest data', response);
          this.upsertMany(response.data);
          this.patchState({
            ...this.ctx.getState(),
            pagedData: {
              current_page: response.current_page,
              last_page: response.last_page,
              per_page: response.per_page,
              total: response.total,
            },
          });
          this.sort({
            sortBy: 'id',
            sortByOrder: SortOrderType.DESC
          });
        }
      )
    );
  }
}
