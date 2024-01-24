import { Component, OnInit } from '@angular/core';
import {CustomerManagerService} from './customer-manager.service';

@Component({
  selector: 'app-customer-manager',
  templateUrl: './customer-manager.component.html',
  styleUrls: ['./customer-manager.component.css']
})
export class CustomerManagerComponent implements OnInit {

  constructor(private customerManagementService: CustomerManagerService) { }

  ngOnInit(): void {
    this.customerManagementService.getCustomerList().subscribe();
  }

  sendTextMessage() {

  }

  sendEmail() {

  }

  /**
   * Customer insight.
   */
  getInsightList() {

  }
}
