import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { NzMessageService } from 'ng-zorro-antd/message'
import { map, Observable, Subscription, take } from 'rxjs'
import { AppState } from 'src/app/app.store'
import { UsersService } from 'src/app/services/users.service'
import { imageFallBack } from 'src/util'
import { ApiResponse, emptyUser, User } from '../../../../../common/types'

@Component({
    selector: 'app-user-profile-edit',
    templateUrl: './user-profile-edit.component.html',
    styleUrls: ['./user-profile-edit.component.css'],
})
export class UserProfileEditComponent implements OnInit {
    imgFall: string = imageFallBack

    editingUser: User = emptyUser('')

    loading: boolean = false

    showModalEditAvatar: boolean = false

    userInfo: Observable<User> = this.store.select('app').pipe(
        map((state: AppState) => {
            return state.user
        })
    )

    isAdmin: Observable<boolean> = this.store.select('app').pipe(
        map((state: AppState) => {
            return (state.user.type == 'Admin') as boolean
        })
    )

    constructor(
        private route: ActivatedRoute,
        private userService: UsersService,
        private router: Router,
        private message: NzMessageService,
        private store: Store<{ app: AppState }>
    ) {
        const userId: string | null = this.route.snapshot.paramMap.get('id')

        if (userId != null) {
            this.loading = true

            this.userService.get(userId).subscribe((res: ApiResponse) => {
                if (res.status == 200) {
                    this.editingUser = res.result as User
                } else {
                    this.router.navigateByUrl('/notfound')
                }
                this.loading = false
            })
        } else {
            this.router.navigateByUrl('/notfound')
        }
    }

    ngOnInit(): void {}

    toggleModalEditAvatar() {
        this.showModalEditAvatar = !this.showModalEditAvatar
    }

    onSaveUser() {
        let userId: string = ''

        let userIdSubscription: Subscription = this.userInfo.pipe(take(1)).subscribe((user: User) => (userId = user.id))
        userIdSubscription.unsubscribe()

        if (userId == this.editingUser.id) {
            this.userService.edit(this.editingUser).subscribe((res: ApiResponse) => {
                if (res.status == 200) {
                    this.message.create('success', `Saved successfully!`)
                } else {
                    this.router.navigateByUrl('/error')
                }
            })
        } else {
            this.message.create('error', `You don't have permission to do this!`)
        }
    }
}