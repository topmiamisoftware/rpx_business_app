import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser'

@Injectable({
  providedIn: 'root'
})
export class SpotbieMetaService {
  constructor(private titleService: Title, private metaService: Meta) { }

  public setTitle(title: string): void{
    this.titleService.setTitle(title)
    this.metaService.updateTag({name: 'twitter:title', content: title })
    this.metaService.updateTag({name: 'og:title', content: title })
  }

  public setDescription(description: string): void{
    this.metaService.updateTag({name: 'description', content: description })
    this.metaService.updateTag({name: 'og:description', content: description })
    this.metaService.updateTag({name: 'twitter:description', content: description })
    this.metaService.updateTag({name: 'robots', content: 'index, follow'})
  }

  public setImage(imageUrl: string): void{
    this.metaService.updateTag({name: 'image', content: imageUrl})
    this.metaService.updateTag({name: 'og:image', content: imageUrl})
    this.metaService.updateTag({name: 'twitter:image', content: imageUrl})
  }
}
