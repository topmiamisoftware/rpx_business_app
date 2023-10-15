import { DomSanitizer } from '@angular/platform-browser';

export function videoEmbedCheck(stream_content : string, _sanitizer : DomSanitizer) {

    if (stream_content == '') return 'no_video';

    //console.log("stream_content ", stream_content);
    if (stream_content != undefined || stream_content != '') {
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        const match = stream_content.match(regExp);
        //console.log("match _content  ", match);
        if (match && match[1].length == 11) {
          // Do anything for being valid
          // if need to change the url to embed url then use below line
          let url_embed = _sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + match[1] + '?autoplay=0');
          let youtube_san_obj = {
            video_url : 'https://www.youtube.com/embed/' + match[1] + '?autoplay=0',
            url_embed : url_embed
          }

          return youtube_san_obj;

        } else {
          return 'no_video';
        }
    }

}

export function checkFriendTags(txt : string){}

export async function checkStreamText(e ?: any){

  clearTimeout(this.check_stream_text_timeout)

  let text

  if(e === undefined){
    text = this.stream_post.stream_content
  } else {
    text = e.target.value
  }

  this.check_stream_text_timeout = setTimeout(async function(){

    let youtube_obj : any = await videoEmbedCheck(text, this._sanitizer)

    if(youtube_obj.video_url == this.current_video_url) return

    if(youtube_obj !== 'no_video'){
      this.embed_content = true
      this.current_video_url =  youtube_obj.video_url
      this.current_embed_video = youtube_obj.url_embed
    } else {
      this.embed_content = false
      this.current_video_url = null
      this.current_embed_video = null
    }

  }.bind(this, text), 700)

  this.checkFriendTags(text)

}
