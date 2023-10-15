export class InfoObject{
    private _qr_code_link: string
    private _id: string
    private _type_of_info_object_category: string
    private _is_community_member: string
    private _type_of_info_object: string
    private _image_url: string
    private _hours: Array<any>
    private _isOpenNow: any
    private _location: any
    private _categories: any
    private _address: string
    private _name: string
    private _rating_image: string
    private _rating: string
    private _photo: string
    private _alias: string
    private _coordinates: any
    private __embedded: any
    private _priceRanges: Array<any>
    private _user_type: number
    price: number = null
    phone: string = null
    distance = null
    friendly_transactions = null
    price_on = null
    loc_x = null
    loc_y = null

    set id(value: any){
        this._id = value
    }

    get id(): any{
        return this._id
    }

    set type_of_info_object_category(value: string){
        this._type_of_info_object_category = value
    }

    get type_of_info_object_category(): string{
        return this._type_of_info_object_category
    }

    set is_community_member(value: string){
        this._is_community_member = value
    }

    get is_community_member(): string{
        return this._is_community_member
    }

    set type_of_info_object(value: string){
        this._type_of_info_object = value
    }

    get type_of_info_object(): string{
        return this._type_of_info_object
    }

    set image_url(value: string){
        this._image_url = value
    }

    get image_url(): string{
        return this._image_url
    }

    set hours(value: Array<any>){
        this._hours = value
    }

    get hours(): Array<any>{
        return this._hours
    }

    set isOpenNow(value: any){
        this._isOpenNow = value
    }

    get isOpenNow(): any{
        return this._isOpenNow
    }

    set location(value: any){
        this._location = value
    }

    get location(): any{
        return this._location
    }

    set categories(value: any){
        this._categories = value
    }

    get categories(): any{
        return this._categories
    }

    set address(value: any){
        this._address = value
    }

    get address(): any{
        return this._address
    }

    set name(value: any){
        this._name = value
    }

    get name(): any{
        return this._name
    }

    set rating_image(value: any){
        this._rating_image = value
    }

    get rating_image(): any{
        return this._rating_image
    }

    set rating(value: any){
        this._rating = value
    }

    get rating(): any{
        return this._rating
    }

    set photo(value: any){
        this._photo = value
    }

    get photo(): any{
        return this._photo
    }

    set alias(value: any){
        this._alias = value
    }

    get alias(): any{
        return this._alias
    }

    set url(value: any){
        this._alias = value
    }

    get url(): any{
        return this._alias
    }

    set coordinates(value: any){
        this._coordinates = value
    }

    get coordinates(): any{
        return this._coordinates
    }

    set _embedded(value: any){
        this._embedded = value
    }

    get _embedded(): any{
        return this._embedded
    }

    set priceRanges(value: Array<any>){
        this._priceRanges = value
    }

    get priceRanges(): Array<any>{
        return this._priceRanges
    }

    set user_type(value: number){
        this._user_type = value
    }

    get user_type(): number{
        return this._user_type
    }

    set qr_code_link(value: string){
        this._qr_code_link = value
    }

    get qr_code_link(): string{
        return this._qr_code_link
    }

}
