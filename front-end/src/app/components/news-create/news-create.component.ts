import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { nanoid } from 'nanoid'
import { NzStatus } from 'ng-zorro-antd/core/types'
import { NzMessageService } from 'ng-zorro-antd/message'
import { AppState } from 'src/app/app.store'
import { NewsManagementService } from 'src/app/services/news-management.service'
import { ApiResponse, emptyNews, News, Tag, User } from '../../../../../common/types'
import { imageFallBack } from 'src/util'
import { concat, map, Observable, Subscription, take } from 'rxjs'
import { addToNewsCount } from '../../app.store'
import { ArtistService } from 'src/app/services/artist.service'

@Component({
    selector: 'app-news-create',
    templateUrl: './news-create.component.html',
    styleUrls: ['./news-create.component.css'],
})
export class NewsCreateComponent implements OnInit {
    avaliableTags: Tag[] = []
    imgFall: string = imageFallBack

    statusInputTitle: 'secondary' | 'warning' | 'danger' | 'success' | undefined = undefined
    statusInputContent: NzStatus = ''
    statusInputDescription: 'secondary' | 'warning' | 'danger' | 'success' | undefined = undefined

    news: News = emptyNews('', '')

    userInfo: Observable<User> = this.store.select('app').pipe(
        map((state: AppState) => {
            return state.user
        })
    )

    constructor(
        private newsManagementService: NewsManagementService,
        private message: NzMessageService,
        private router: Router,
        private store: Store<{ app: AppState }>,
        private artistService: ArtistService
    ) {
        this.artistService.getTags().subscribe((res: ApiResponse) => {
            if (res.status == 200) {
                this.avaliableTags = res.result as Tag[]
            } else {
                this.router.navigateByUrl('/notfound')
            }
        })
    }

    ngOnInit(): void {}

    validateEditInfo(): boolean {
        var result: boolean = true

        this.statusInputTitle = undefined
        this.statusInputDescription = undefined
        this.statusInputContent = ''

        if (this.news.title == '') {
            this.statusInputTitle = 'danger'
            result = false
        }

        if (this.news.markdownText == '') {
            this.statusInputContent = 'error'
            result = false
        }

        if (this.news.description == '') {
            this.statusInputDescription = 'danger'
            result = false
        }

        return result
    }

    onCreateNews(): void {
        var result: boolean = this.validateEditInfo()

        if (result == false) {
            this.message.create('error', `Please make sure that Title, Content and Description are not empty!`)
            return
        }

        let currentDate = new Date()

        let date = currentDate.toLocaleDateString()
        let hour = currentDate.toLocaleTimeString()

        let authorId: string = ''

        let userIdSubscription: Subscription = this.userInfo.pipe(take(1)).subscribe((user: User) => (authorId = user.id))
        userIdSubscription.unsubscribe()

        let temp: News = {
            ...this.news,
            id: nanoid(),
            authorId: authorId,
            date: date + ' ' + hour.slice(0, -3),
        }

        this.newsManagementService.create(temp).subscribe((res: ApiResponse) => {
            if (res.status == 200) {
                this.message.create('success', `New news created successfully!`)
                this.store.dispatch(addToNewsCount({ payload: 1 }))
                this.router.navigateByUrl('/home/news/' + temp.id)
            } else {
                this.message.create('error', `Failed to create the news!`)
                this.router.navigateByUrl('/error')
            }
        })
    }
}