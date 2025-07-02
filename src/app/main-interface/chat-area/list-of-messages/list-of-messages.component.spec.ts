import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfMessagesComponent } from './list-of-messages.component';

describe('ListOfMessagesComponent', () => {
  let component: ListOfMessagesComponent;
  let fixture: ComponentFixture<ListOfMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
