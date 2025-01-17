import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { map, Observable, Subscription, take } from 'rxjs'
import { ApiResponse, User, emptyUser } from '../../../common/types'
import { addToArtistCount, addToNewsCount, addToUserCount, addURLToHistory, AppState, changeUserInfo, changeUserLoggedStatus } from './app.store'
import { NewsManagementService } from './services/news-management.service'
import { imageFallBack } from 'src/util'
import { Event, NavigationStart, Router } from '@angular/router'
import { UsersService } from './services/users.service'
import { ArtistService } from './services/artist.service'
import { fadeAnimation } from './app.animations'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [fadeAnimation],
})
export class AppComponent implements OnInit {
    imgFall: string = imageFallBack

    title = 'front-end'
    showProfile: boolean = false

    theme: string = 'light'

    logged: Observable<Boolean> = this.store.select('app').pipe(
        map((state: AppState) => {
            return state.logged
        })
    )

    userInfo: Observable<User> = this.store.select('app').pipe(
        map((state: AppState) => {
            return state.user
        })
    )

    notMod: Observable<boolean> = this.store.select('app').pipe(
        map((state: AppState) => {
            return (state.user.type != 'Mod') as boolean
        })
    )

    constructor(
        private store: Store<{ app: AppState }>,
        private newsManagementService: NewsManagementService,
        private router: Router,
        private userService: UsersService,
        private artistService: ArtistService
    ) {
        let userJsonStr: string | null = localStorage.getItem('userInfo')

        if (userJsonStr != null) {
            let user: User = JSON.parse(userJsonStr)

            this.store.dispatch(changeUserInfo({ payload: user }))
            this.store.dispatch(changeUserLoggedStatus({ payload: true }))
        }

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                let currentURL: string = event.url

                this.store.dispatch(addURLToHistory({ payload: currentURL }))
            }
        })

        this.newsManagementService.getNewsSize().subscribe((res: ApiResponse) => {
            if (res.status == 200) {
                this.store.dispatch(addToNewsCount({ payload: res.result as number }))
            } else {
                this.store.dispatch(addToNewsCount({ payload: 0 }))
            }
        })

        this.userService.getUsersSize().subscribe((res: ApiResponse) => {
            if (res.status == 200) {
                this.store.dispatch(addToUserCount({ payload: res.result as number }))
            } else {
                this.store.dispatch(addToUserCount({ payload: 0 }))
            }
        })

        this.artistService.getArtistsSize().subscribe((res: ApiResponse) => {
            if (res.status == 200) {
                this.store.dispatch(addToArtistCount({ payload: res.result as number }))
            } else {
                this.store.dispatch(addToArtistCount({ payload: 0 }))
            }
        })
    }

    ngOnInit() {}

    showProfileDrawer() {
        this.showProfile = true
    }

    hideProfileDrawer() {
        this.showProfile = false
    }

    onLogout() {
        this.store.dispatch(
            changeUserInfo({
                payload: emptyUser(''),
            })
        )
        this.store.dispatch(changeUserLoggedStatus({ payload: false }))
        this.router.navigateByUrl('/home')
    }

    onLogin() {
        this.router.navigateByUrl('/login')
        this.showProfile = false
    }

    onEditProfile() {
        let userId: string = ''

        let userIdSubscription: Subscription = this.userInfo.pipe(take(1)).subscribe((user: User) => (userId = user.id))
        userIdSubscription.unsubscribe()

        this.router.navigateByUrl(`/home/user/${userId}`)
        this.showProfile = false
    }
}
