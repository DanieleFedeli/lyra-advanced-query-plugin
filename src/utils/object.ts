export function pick<TObject extends Record<string, unknown>>(obj: TObject, properties: string[]){
    const picked = Object.create(null);

    const objKeys = Object.keys(obj);
    const _properties = objKeys.length > properties.length ? properties : objKeys;

    for(const property of _properties) {
        // Not supporting nested properties yet
        if(property.includes('.')) continue;
        picked[property] = obj[property];   
    }

    return picked;
}
