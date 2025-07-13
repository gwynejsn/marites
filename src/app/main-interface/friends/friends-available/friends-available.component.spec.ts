import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsAvailableComponent } from './friends-available.component';

describe('FriendsAvailableComponent', () => {
  let component: FriendsAvailableComponent;
  let fixture: ComponentFixture<FriendsAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsAvailableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
