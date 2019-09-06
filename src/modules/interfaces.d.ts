interface IMap<T> {
    [key: number]: T
}

interface ICoords {
    x: number,
    y: number,
    // whether x & y values are relative (not absolute)
    isRelative?: boolean
}

interface IPersonData {
    id: number,
    name: string,
    sex: "f" | "m",
    parent?: number
}

interface ISpouseData {
    id: number,
    name: string,
    sex: "f" | "m",
    partner: number,
    children?: number[],
    since: string,
    till?: string
}