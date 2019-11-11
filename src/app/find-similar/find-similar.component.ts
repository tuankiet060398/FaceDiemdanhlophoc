import { Component, OnInit } from '@angular/core';
import { FaceApiService } from '../services/face-api-service.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'app-find-similar',
  templateUrl: './find-similar.component.html',
  styleUrls: ['./find-similar.component.css']
})
export class FindSimilarComponent implements OnInit {
  public faces: any[];
  public loading = false;
  public imageUrls: string[];
  public queryFace: string = 'https://lh3.googleusercontent.com/kvh3Vav9EUzKdvH8jeUbD2grO_cftMq_c-yy-oPF4c0uvKc1OhWOWlWoLlMNjT2guVc7f_McErCYXxZsNKHRrzdgrKuhNcV_6qM7JAoH-F7j0eBYTRi9h0HY9l1EzwmJCozu0YLcOARE7Gzh68WlveKFYNag1T5_i4jfuN_-Pp0km9TZDgHUsrlWLiIeCGjqi3_-g-4-2HyUKWYlHADDbqQKPzvK6EUQ6no5VPaumM9hp2T9F8fHR3gCOsdrsCYMO-qYgDc0xDFHpHgVzbp9ur-Mus5AVa733Ks4p2SOnBvBsjGvCt8F6yzin_y9-PPd8uuV_pMCBHUH7wEVGAdtgVKGVcUTB73CBR9rPJWKQhRoCTELBNIG5MbyikYOXR5ZMcUBS1VnbP5Y8qfOC4MTabxnHA7iabR9VtLCM4R0Nh4mk_zXOEu2rJyFFxo5nhtFaGxVbV2YBEO2CMP_aN0h2sA_LUzrkfscRamv06krluzPUZWKlHz-nkd9G1WMbs4rHgy_-BNsnGXsQ3jIUEImgOocyogtKTQygaj-Ha-eOJ55OvSE6eHzaXQ6UJfEJQRJKZnYOUvuCwO_OBRwojdMMS1Mun6e1wWnEJswT9O-KVP85wf212b0SMM5vQ1bGuXjyRt134Y_BpbxUQGGPKMDPfaqWqOGvRwyWXrvt7venb-ejhx2n0TNBX44BRC4BciIOzHyTRphbYbVhte3T3O2DKLbLNxrYYhaDxsHDmOKyV9JGicB=s883-no';
  public findSimilarResults: any[];

  constructor(private faceApi: FaceApiService) { }

  ngOnInit() { }

  findSimilar() {
    this.loading = true;

    // 1. First create a face list with all the imageUrls
    let faceListId = (new Date()).getTime().toString(); // comically naive, but this is just for demo
    this.faceApi.createFaceList(faceListId).subscribe(() => {

      // 2. Now add all faces to face list
      let facesSubscribableList = [];
      let urls = _.split(this.imageUrls, '\n');
      _.forEach(urls, url => {
        if (url) {
          facesSubscribableList.push(this.faceApi.addFace(faceListId, url));
        }
      });

      forkJoin(facesSubscribableList).subscribe(results => {
        this.faces = [];
        _.forEach(results, (value, index) => this.faces.push({ url: urls[index], faceId: value.persistedFaceId }));

        // 3. Call Detect on query face so we can establish a faceId 
        this.faceApi.detect(this.queryFace).subscribe(queryFaceDetectResult => {
          let queryFaceId = queryFaceDetectResult[0].faceId;

          // 4. Call Find Similar with the query face and the face list
          this.faceApi.findSimilar(faceListId, queryFaceId).subscribe(finalResults => {
            console.log('**findsimilar Results', finalResults);
            this.findSimilarResults = finalResults;
            this.loading = false;
          });
        });
      });
    });
  }

  getUrlForFace(faceId) {
    var face = _.find(this.faces, { faceId: faceId });
    return face.url;
  }

}
