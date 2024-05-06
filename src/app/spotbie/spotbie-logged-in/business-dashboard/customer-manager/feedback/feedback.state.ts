import {NgxsDataEntityCollectionsRepository} from '@angular-ru/ngxs/repositories';
import {Computed, StateRepository} from '@angular-ru/ngxs/decorators';
import {Injectable} from '@angular/core';
import {State} from '@ngxs/store';
import {createEntityCollections} from '@angular-ru/cdk/entity';
import {Observable, tap} from 'rxjs';
import {CustomerManagerService} from '../customer-manager.service';
import {Feedback} from "../../../../../models/feedback";

@StateRepository()
@State({
  name: 'feedback',
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
export class FeedbackEntitiesState extends NgxsDataEntityCollectionsRepository<Feedback> {
  constructor(private customerManagementService: CustomerManagerService) {
    super();
  }

  ngxsOnInit() {
    this.reset();
  }

  @Computed()
  get feedbackList$(): Observable<Feedback[]> {
    return this.entitiesArray$;
  }

  getFeedbackList() {
    return this.customerManagementService.getFeedbackList().pipe(
      tap(
        (response: {
          data: Feedback[];
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        }) => {
          const feedback = response.data.map((f) => ({...f, id: f.uuid}));
          this.upsertMany(feedback);
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
