import {NgxsDataEntityCollectionsRepository} from '@angular-ru/ngxs/repositories';
import {RecentGuest, SmsGroup} from '../models';
import {DataAction, StateRepository} from '@angular-ru/ngxs/decorators';
import {Injectable} from '@angular/core';
import {State} from '@ngxs/store';
import {createEntityCollections} from '@angular-ru/cdk/entity';
import {tap} from 'rxjs';
import {CustomerManagerService} from '../customer-manager.service';

@StateRepository()
@State({
  name: 'SmsGroup',
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
export class SmsGroupEntitiesState extends NgxsDataEntityCollectionsRepository<SmsGroup> {
  constructor(private customerManagementService: CustomerManagerService) {
    super();
  }

  @DataAction({subscribeRequired: false})
  getSmsGroupList() {
    return this.customerManagementService.getSmsGroupList().pipe(
      tap(
        (response: {
          data: SmsGroup[];
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        }) => {
          console.log('getSmsGroupList', response);
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
        }
      )
    );
  }
}
