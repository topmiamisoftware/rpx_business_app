import {NgxsDataEntityCollectionsRepository} from '@angular-ru/ngxs/repositories';
import {EmailGroup} from '../models';
import {DataAction, StateRepository} from '@angular-ru/ngxs/decorators';
import {Injectable} from '@angular/core';
import {State} from '@ngxs/store';
import {createEntityCollections} from '@angular-ru/cdk/entity';
import {tap} from 'rxjs';
import {CustomerManagerService} from '../customer-manager.service';
import {SortOrderType} from "@angular-ru/cdk/typings";

@StateRepository()
@State({
  name: 'EmailGroup',
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
export class EmailGroupEntitiesState extends NgxsDataEntityCollectionsRepository<EmailGroup> {
  constructor(private customerManagementService: CustomerManagerService) {
    super();
  }

  ngxsOnInit() {
    this.reset();
  }

  @DataAction({subscribeRequired: false})
  getEmailGroupList() {
    return this.customerManagementService.getEmailGroupList().pipe(
      tap(
        (response: {
          data: EmailGroup[];
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        }) => {
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
