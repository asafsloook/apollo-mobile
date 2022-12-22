function generateHash() {
    let hash = "0x";
    for (var i = 0; i < 64; i++) {
        hash += Math.floor(Math.random() * 16).toString(16);
    }
    return hash;
}

class Random {

    constructor() {
        if (!window.params) window.params = { seed: generateHash() };
        this.useA = false;
        let sfc32 = function (uint128Hex) {
            let a = parseInt(uint128Hex.substr(0, 8), 16);
            let b = parseInt(uint128Hex.substr(8, 8), 16);
            let c = parseInt(uint128Hex.substr(16, 8), 16);
            let d = parseInt(uint128Hex.substr(24, 8), 16);
            return function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                let t = (((a + b) | 0) + d) | 0;
                d = (d + 1) | 0;
                a = b ^ (b >>> 9);
                b = (c + (c << 3)) | 0;
                c = (c << 21) | (c >>> 11);
                c = (c + t) | 0;
                return (t >>> 0) / 4294967296;
            };
        };
        this.prngA = new sfc32(window.params.seed.substr(2, 32));
        this.prngB = new sfc32(window.params.seed.substr(34, 32));
        for (let i = 0; i < 1e6; i += 2) {
            this.prngA();
            this.prngB();
        }
    }
    random_dec() {
        this.useA = !this.useA;
        return this.useA ? this.prngA() : this.prngB();
    }
    random_num(a, b) {
        return a + (b - a) * this.random_dec();
    }
    random_int(a, b) {
        return Math.floor(this.random_num(a, b + 1));
    }
    random_bool(p) {
        return this.random_dec() < p;
    }
    random_choice(list) {
        return list[this.random_int(0, list.length - 1)];
    }
}

let DEFAULT_SIZE = 1000, R = new Random(), DIM, M, colors = {}, grid = 0,
    options = {}, shapes = [], intersections = {}, intersectionsSizes = {},
    lines = { vert: {}, horiz: {}, diagonal: [] }, bg = '#e0dacc', min_stroke = 1,
    max_stroke = 2.5, helper = {}, state = { color: 0, grain: 0 }, density = 2;

const paletteNames = {
    "1": "Zeus",
    "2": "Nemesis",
    "3": "Aphrodite",
    "4": "Apollo",
    "5": "Ares",
    "6": "Hephaestus",
    "7": "Nike",
    "8": "Artemis",
    "9": "Athena",
    "10": "Hecate",
    "11": "Hermes",
    "12": "Dionysus",
    "13": "Hades",
    "14": "Hypnos",
    "15": "Demeter",
    "16": "Janus",
    "17": "Hera",
    "18": "Poseidon",
    "19": "Tyche",
    "20": "Iris",
}

function getPalette() {

    let dict = {

        1: ["#D04B38", "#4D89AB", "#F4DDB2", "#1B3146"],
        2: ["#E16601", "#83754E", "#20211C", "#E8C988"],
        3: ["#393230", "#F7F0DB", "#F8C9B2", "#AA2B34", "#E99A51"],
        4: ["#F6DB77", "#FBB355", "#DC252A", "#2C221E"],
        5: ["#CC3622", "#DDB779", "#590F02", "#9A9855"],
        6: ["#F6EAC0", "#0D1218", "#4F565C", "#AE8F61"],
        7: ["#145F6C", "#AB342C", "#1F272A", "#E3CBA4"],
        8: ["#C78934", "#CAAC1C", "#143728", "#2F613B", "#0F2A1A"],
        9: ['#F6F1D3', '#254144', '#BED8C9', '#229A8D'],
        10: ['#C47B59', '#9D3D28', '#E8C789', '#53373A', '#30313E', '#396934'],
        11: ['#786865', '#544650', '#53373A', '#E5B24E', '#9D3D28'],
        12: ['#CBC8B8', '#8F9D82', '#544650', '#786865', '#F5EAC2'],

        13: ["#44A47E", "#E0C87C", "#DC640E", "#043434"],
        14: ["#006F6D", "#E5E1C6", "#EA5339", "#340100"],
        15: ['#362a17', '#405D3A', '#297545', '#A1A66A', '#E3C37C'],
        16: ['#D1CCB5', '#5B231F', '#CF5F5B', '#2D5542', '#668067'],
        17: ['#CCBD8F', '#AA6425', '#264224', '#495423', '#70A494'],
        18: ['#098F75', '#9DBBCD', '#82AFBB', '#142755'],
        19: ['#C47B59', '#E8C789', '#E4CFB7', '#E5B24E', '#F5EAC2'],
        20: ["#AB342C", "#145F6C", "#e5ac3c", "#20211C"],

    }

    return dict[options.palette];
}

function getOptions() {
    return {
        position_type: null,
        maxOrph: R.random_bool(0.9) ? R.random_int(1, R.random_choice([10, 15, 20])) : 1,
        shapes_border: true,
        stroke: 0.5,
        is_diagonal: R.random_bool(0.5),
        orph_side: R.random_choice(['h', 'v']),
        color_count: R.random_choice([0, 5, 50]),
        texture_dir: R.random_choice(['x', 'y']),
        texture_dir_reverse: R.random_bool(0.5),
        texture_dir_reverse_static: R.random_bool(0.5),
        texture_prob: R.random_choice([0.5, 0.75]),
        texture_max: R.random_choice([0.75, 1]),
        colors_grain: R.random_choice([0.05]),
        patterns: R.random_int(1, 3),
        draw_borders_change: R.random_choice([0.01, 0.1]),
        isDouble: R.random_bool(0.5),
        isDoubleType: R.random_bool(0.5),
        doubleMax: R.random_choice([3, 6, 10]),
        isMainDouble: R.random_bool(0.1),
        isSecDouble: R.random_bool(0.25),
        empty: R.random_bool(0.5),
        empty_prob: R.random_choice([0.4, 0.5]),
        ratio: 1.5,
        frame_border: R.random_choice([0.05]),
        changePosition: R.random_bool(0.5),
        changePosition2: R.random_bool(0.5),
        changeSecPosition: R.random_bool(0.5),
        changeCirclePosition: R.random_bool(0.25),
        maxChangePositionCircle: R.random_choice([0.25, 0.5]),
        maxChangePositionSec: R.random_choice([0.5, 0.75, 1]),
        palette: R.random_int(1, 20),
        bgType: R.random_bool(0.06),
        less: R.random_bool(0.25),
        out_frame: R.random_bool(0.1),
        white: R.random_bool(0.25)
    }
}

function genOptions() {
    const res = {};
    const o_ = getOptions();
    const props = Object.keys(o_);
    while (Object.keys(res).length < props.length) {
        const prop = R.random_choice(props);
        if (!(prop in Object.keys(res))) {
            res[prop] = getOptions()[prop]
        }
    }
    return res;
}

function cfl(str) {
    return str[0].toUpperCase() + str.substring(1);
}

function setMetadataAndComplete() {
    const pt = options.position_type;
    if (pt.includes('_')) {
        options.position_type = pt.substring(0, pt.indexOf('_'))
    }

    window.metadata = {
        "Palette": paletteNames[options.palette],
        "Composition": cfl(options.position_type),
        "Background": options.bgType ? "Random" : "Paper",
        "Circles Escape": cfl(options.out_frame.toString()),
        "Light Colors": cfl(options.white.toString()),
        "Aspect Ratio": cfl(options.ratio.toString()),
        "Out of Ink": cfl(options.empty.toString()),
        "Double Borders": cfl(options.isDouble.toString()),
    };
    document.complete = true;
}

function genPositionType() {
    let type = R.random_dec(), res;
    switch (true) {
        case type < 0.05:
            res = 'robert'
            break;
        case type < 0.1:
            res = R.random_choice(['sonia', 'sonia_orph'])
            break;
        case type < 0.15:
            options.out_frame = false;
            res = 'portal'
            break;
        case type < 0.25:
            res = `dmitri_${R.random_choice(['b', 'c'])}`
            break;
        case type < 0.35:
            res = 'space'
            break;
        case type < 0.45:
            res = 'oracle'
            break;
        case type < 0.65:
            res = 'piton'
            break;
        default:
            res = 'delphi'
            break;
    }
    return res
}

function setProps() {
    options = genOptions();
    options.position_type = genPositionType();
    colors.fill = getPalette();
    let count = options.color_count;
    for (let i = 0; i < count; i++) {
        let c1 = color(R.random_choice(colors.fill));
        let c2 = color(R.random_choice(['#fff', '#000']));
        colors.fill.push(lerpColor(c1, c2, R.random_num(0.01, 0.1)))
    }
    if (options.white) {
        const count = colors.fill.length * R.random_num(0, 0.5)
        for (let index = 0; index < count; index++) {
            colors.fill.push('#fff')
        }
    }
}

function setup() {
    let seed = R.random_num(1, 999999999);
    noiseSeed(seed);
    randomSeed(seed);

    setProps();

    pixelAndDim();

    createCanvas(DIM, getHeight_());
}

function getHeight_() {
    return ((1 - options.frame_border) * DIM * options.ratio) + DIM * options.frame_border;
}

function createPatterns() {
    let res = [];
    for (let i = 0; i < options.patterns; i++) {
        res.push(createLinesPattern())
        res.push(createGradientPattern())
    }
    return res
}

function getTwoColors() {
    while (true) {
        let a = R.random_choice(colors.fill)
        let b = R.random_choice(colors.fill)
        if (a !== b)
            return [a, b];
    }
}

function createGradientPattern() {
    const ds = DEFAULT_SIZE * options.ratio;
    let pg = createGraphics(ds, ds);
    pg.pixelDensity(density);
    let cc = getTwoColors();
    let c1 = color(cc[0]);
    let c2 = color(cc[1]);
    pg.strokeWeight(2)
    for (let y = 0; y < ds; y++) {
        let n = map(y, 0, ds, 0, 1);
        let newc = lerpColor(c1, c2, n);
        pg.stroke(newc);
        pg.line(0, y, ds, y);
    }
    return pg;
}

function createLinesPattern() {
    const ds = DEFAULT_SIZE * options.ratio;
    let pg = createGraphics(ds, ds);
    pg.pixelDensity(density);
    let cc = getTwoColors();
    pg.background(cc[0])
    let type = R.random_choice(['v', 'h', 'd1', 'd2'])
    pg.fill(cc[1]);
    pg.noStroke()
    let d = R.random_choice([10, 10, 15])
    let radius = 1 * M
    if (type === 'v')
        for (let x = 2; x < ds; x += d) {
            drawLine(radius, x, 0, x, ds, pg)
        }
    if (type === 'h')
        for (let y = 2; y < ds; y += d) {
            drawLine(radius, 0, y, ds, y, pg)
        }
    if (type === 'd1')
        for (let x = 2, y = 2; x < ds * 2;) {
            drawLine(radius, 0, y, x, 0, pg)
            x += d * 2;
            y += d * 2;
        }
    if (type === 'd2')
        for (let x = ds - 2, y = 2; x > -ds;) {
            drawLine(radius, ds, y, x, 0, pg)
            x -= d * 2;
            y += d * 2;
        }

    return pg;
}

function setCanvasBG() {
    const getBg_ = () => {
        while (true) {
            const c = R.random_choice(colors.fill);
            if (c !== '#fff')
                return c;
        }
    }
    background(options.bgType ? getBg_() : bg)
}

function draw() {
    colors.pattern = createPatterns();
    setCanvasBG();
    start_();
    noLoop();
}

function pixelAndDim() {
    pixelDensity(density);
    DIM = Math.round(window.innerWidth);
    if (DIM % 2 !== 0) DIM++;
    M = DIM / DEFAULT_SIZE;
}

function getCirclePos(r, c) {
    let size = getShapeSize();
    return {
        ...getShapePos(r, c),
        type: 'circle',
        r: size * 0.4
    }
}

function getShapePos(r, c) {

    let size = getShapeSize();
    let diffX = R.random_num(-1, 1)
    let diffY = R.random_num(-1, 1)
    let border = DEFAULT_SIZE * options.frame_border;
    return {
        x: border + c * size + size / 2 + diffX,
        y: border + r * size + size / 2 + diffY
    }

}

function getShapeSize() {
    return DEFAULT_SIZE * (1 - options.frame_border * 2) / options.grid;
}

function getTrianglePos(r, c, size_ = 1) {
    let size = size_ * getShapeSize() / 2;
    let pos = getShapePos(r, c);
    let dif = R.random_num(0, PI * 2)
    let point_ = (x, y, r, angle) => {
        return {
            x: r * cos(angle) + x,
            y: r * sin(angle) + y
        }
    }
    return {
        p1: point_(pos.x, pos.y, size, 0 + dif),
        p2: point_(pos.x, pos.y, size, (1 / 3) * TWO_PI + dif),
        p3: point_(pos.x, pos.y, size, (2 / 3) * TWO_PI + dif),
        x: pos.x,
        y: pos.y,
        r: size,
        type: 'triangle'
    }
}

function drawSecShapes() {
    let bg = R.random_int(1, 4);
    if (bg === 1) squareBG()
    if (bg === 2) fullRects()
    if (bg === 3) fullTrios()
    if (bg === 4) linesBG(R.random_bool(0.5))
}

function squareBG(r = 0, c = 0, g = 1) {
    options.grid = g;
    setOneShape(r, c, 'square', 0.5)
    const shape = getLastShape();
    shape.square_bg = true;
    let ratio = options.ratio;
    const s = options.frame_border * 2;
    let start = DEFAULT_SIZE * s;
    let end = DEFAULT_SIZE * (1 - s);
    shape.w = end - start;
    shape.h = end * ratio - start / ratio;
    shape.y = start;
    shape.x = start;
}

function randomTri() {
    let min = -DEFAULT_SIZE * 0.1;
    let max = DEFAULT_SIZE * 1.1;
    let getRange = () => {
        return R.random_num(0, DEFAULT_SIZE)
    }
    let getPoint = () => {
        return R.random_choice([
            {
                x: min,
                y: getRange()
            },
            {
                x: max,
                y: getRange()
            },
            {
                y: min,
                x: getRange()
            },
            {
                y: max,
                x: getRange()
            },
        ])
    }
    return {
        ...createShape('triangle'),
        p1: getPoint(),
        p2: getPoint(),
        p3: getPoint(),
    };
}

function fullTrios() {
    let checkTri = (tri) => {
        const d = DEFAULT_SIZE * 0.5
        return dist(tri.p1.x, tri.p1.y, tri.p2.x, tri.p2.y) > d &&
            dist(tri.p1.x, tri.p1.y, tri.p3.x, tri.p3.y) > d &&
            dist(tri.p2.x, tri.p2.y, tri.p3.x, tri.p3.y) > d;
    }
    for (let i = 0; i < R.random_int(5, 10); i++) {
        let tri = randomTri();
        if (checkTri(tri)) shapes.push(tri)
    }
}

function randomColor(isBG) {
    let c = R.random_choice(colors.fill)
    let p = R.random_choice(colors.pattern)
    if (!isBG && !R.random_bool(options.texture_prob)) return bg;
    if (!isBG && R.random_bool(options.empty ? options.empty_prob : 0)) return 'BLANK';
    return R.random_choice([c, c, p]);
}

function drawMainShapes() {
    if (['portal'].includes(options.position_type)) {
        options.grid = 1;
        let total = R.random_int(25, 50);
        for (let i = 1; i < total; i++) {
            setOneShape(0, 0, 'circle', i * 2 * (R.random_int(0.9, 1.1)) / total)
            getLastShape().total = total;
        }
    }

    if (['delphi'].includes(options.position_type)) {

        let chance = 0.75
        let trys = 0;
        let temps = {};
        state.orph = false;
        let count = R.random_int(1, 4);
        for (let i = 0; i < count; i++) {
            if (trys++ > 10000) break;
            options.grid = R.random_int(2, 4)
            let r = randomCell()
            let c = randomCell()
            let radius = options.grid * R.random_num(1, 2);
            if (temps[`${r}_${c}_${options.grid}`]) {
                i--;
            } else {
                if (!state.orph && R.random_bool(chance)) {
                    let total = getOrphNumber();
                    orphCircle(r, c, radius, total)
                    orph = true;
                } else {
                    setOneShape(r, c, 'circle', radius);
                }

                temps[`${r}_${c}_${options.grid}`] = true;
            }
        }
    }

    if (['space'].includes(options.position_type)) {
        spreadCircles();
    }

    if (['sonia', 'sonia_orph'].includes(options.position_type)) {
        let type = R.random_dec();
        let chance = 0
        if (type <= 0.1) chance = 1
        if (type <= 0.9) chance = 0.5
        let trys = 0;
        let isDiagonal = options.is_diagonal
        let count = 10
        for (let i = 0; i < count; i++) {
            if (trys++ > 1000000) {
                break;
            }

            let r = R.random_num(DEFAULT_SIZE * 0.05, DEFAULT_SIZE * 0.2)
            let x = DEFAULT_SIZE * 0.5
            let y = 0
            let lastShape = getLastShape();
            if (lastShape && lastShape.type === 'circle') {
                x = lastShape.x
                y = lastShape.y + (lastShape.r + r / R.random_num(1.5, 2.5))
            }

            let total = getOrphNumber()

            for (let i = 1; i <= total; i++) {
                if (R.random_bool(chance) && i === 1) {
                    let c = {
                        ...createShape('circle'),
                        x, y, r, total
                    };
                    shapes.push(c)
                    break;
                }
                let c = {
                    ...createShape('circle'),
                    x, y, r: i * (r / total), total
                };
                shapes.push(c)
            }
        }
    }

    if (['robert', 'center'].includes(options.position_type)) {
        options.grid = 1;
        orphCircle(0, 0, R.random_num(0.5, 2), getOrphNumber())
    }

    if (['dmitri_b', 'dmitri_c'].includes(options.position_type)) {
        let circles = [];
        const types = [
            [2, 4, 8],
            [3, 6, 12]
        ];
        if (R.random_bool(0.1)) types.push([5, 10, 20])
        let sizes = R.random_choice(types);
        let type = R.random_dec();
        let chance = 0
        if (type <= 0.1) chance = 1
        if (type <= 0.5) chance = 0.5
        let count = sizes[2] * sizes[2];
        let total = R.random_int(count * 0.05, count * R.random_choice([1, 2, 10]));
        for (let i = 0; i < total; i++) {
            options.grid = R.random_choice(sizes)
            let r = randomCell();
            let c = randomCell();
            if ([4, 6, 8, 12].includes(options.grid) && (r === 0 || c === 0 || r === options.grid - 1 || c === options.grid - 1)) continue;
            let draw = true;
            let pos = getCirclePos(r, c);
            let size = getShapeSize() * 0.4;
            for (let j = 0; j < circles.length; j++) {
                let check = circles[j];
                if (collision(check.x, check.y, check.r, pos.x, pos.y, size)) {
                    draw = false;
                }
            }
            if (draw) {
                orphCircle(r, c, 1, R.random_bool(chance) ? 1 : getOrphNumber())
                circles.push(getLastShape());
            }
        }
        options.changePosition2 = false;
    }

    if (options.position_type === 'piton') {
        const type = R.random_bool(0.5)
        const coll = R.random_bool(0.5)
        let getPos = () => {
            return {
                x: R.random_num(0, DEFAULT_SIZE),
                y: R.random_num(0, DEFAULT_SIZE)
            }
        }
        let count = R.random_int(1, R.random_choice([5, 10, 15, 20]));
        if (coll) count = R.random_int(2, R.random_choice([5, 10, 20, 50]));
        if (type) count *= 2;
        for (let i = 0; i < count; i++) {
            let pos_start = getPos();
            const size_ = R.random_num(1, 3);
            let pos_to = getPos();
            let dist_ = dist(pos_start.x, pos_start.y, pos_to.x, pos_to.y)
            let size = (DEFAULT_SIZE - dist_) / size_
            if (type && R.random_bool(0.2)) size = R.random_num(10, 50)
            let draw = true;
            const circles = shapes.filter(x => x.type === 'circle');
            if (coll) {
                for (let j = 0; j < circles.length; j++) {
                    let check = circles[j];
                    if (collision(check.x, check.y, check.r, pos_to.x, pos_to.y, size)) {
                        draw = false;
                    }
                }
            }
            if (!draw) continue;
            shapes.push({
                ...createShape('circle'),
                x: pos_to.x,
                y: pos_to.y,
                r: size / 2,
                total: 1
            })

        }
    }

    if (options.position_type === 'oracle') {
        const genPos = () => { return DEFAULT_SIZE * 0.5 + R.random_num(-DEFAULT_SIZE * 0.2, DEFAULT_SIZE * 0.2) }
        const getR = () => {
            return R.random_choice([
                R.random_num(DEFAULT_SIZE * 0.05, DEFAULT_SIZE * 0.2),
                R.random_num(DEFAULT_SIZE * 0.1, DEFAULT_SIZE * 0.1)
            ])
        }
        shapes.push({
            ...createShape('circle'),
            x: genPos(),
            y: genPos(),
            r: getR()
        })
        options.changePosition = false;
        options.changePosition2 = false;
        options.isMainDouble = false;
        options.isSecDouble = false;
        options.empty = false;
        options.less = R.random_bool(0.5);
    }
}

function checkLineIntersect(obj, number) {
    let diff = 10;
    for (let i = -diff; i <= diff; i++) {
        if (obj[(number + i).toFixed()])
            return true;
    }
    return false;
}

function drawOrphLines(x, y, vert, horiz, isDiagonal) {
    let size = DEFAULT_SIZE * 10;
    if (!isDiagonal) {
        if (vert && !checkLineIntersect(lines.vert, x)) {
            lines.vert[x.toFixed()] = true;
            shapes.push({
                ...createShape('square'),
                x: x,
                y: y - size / 2,
                w: size,
                h: size,
            });
        }

        if (horiz && !checkLineIntersect(lines.horiz, y)) {
            lines.horiz[y.toFixed()] = true;
            shapes.push({
                ...createShape('square'),
                x: x - size / 2,
                y: y,
                w: size,
                h: size,
            })
        }

    } else {
        let isCross = (point1, point2, p1, p2) => {
            let slope = (p1, p2) => {
                return (p2.x - p1.y) / (p2.x - p1.x);
            }
            let yIntercept = (p1, p2) => {
                return (p2.x * p1.y - p1.x * p2.y) / (p2.x - p1.x);
            }

            let m1 = slope(point1, point2);
            let c1 = yIntercept(point1, point2);
            let m2 = slope(p1, p2);
            let c2 = yIntercept(p1, p2);

            return Math.abs(m1 - m2) + Math.abs(c1 - c2) < 25

        }
        let vert_ = {
            ...createShape('triangle'),
            p1: {
                x: x - size,
                y: y - size
            },
            p2: {
                x: x + size,
                y: y + size
            },
            p3: {
                x: x + size,
                y: y - size
            }

        };
        if (vert && !lines.diagonal.some(item => item.type === 'vert' && isCross(item.shape.p1, item.shape.p2, vert_.p1, vert_.p2))) {
            shapes.push(vert_);
            lines.diagonal.push({
                type: 'vert',
                shape: getLastShape()
            })
        }
        let horiz_ = {
            ...createShape('triangle'),
            p1: {
                x: x - size,
                y: y + size
            },
            p2: {
                x: x + size,
                y: y - size
            },
            p3: {
                x: x + size,
                y: y + size
            }
        };
        if (horiz && !lines.diagonal.some(item => item.type === 'horiz' && isCross(item.shape.p1, item.shape.p2, horiz_.p1, horiz_.p2))) {
            shapes.push(horiz_)
            lines.diagonal.push({
                type: 'horiz',
                shape: getLastShape()
            })
        }
    }
}

function setFrameShapes() {

    drawMainShapes();

    if (!['sonia_orph', 'dmitri_c', 'robert'].includes(options.position_type)) {
        drawSecShapes();
        if (options.isSecDouble) {
            drawSecShapes();
        }
    }
    else setOrphLines();
}

function getOrphNumber() {
    return R.random_int(1, options.maxOrph);
}

function orphCircle(r, c, size = 1, total, diff) {
    for (let i = 1; i <= total; i++) {
        setOneShape(r, c, 'circle', i * (size / total));
        let cc = getLastShape()
        if (diff) {
            cc.x += diff.sx
            cc.y += diff.sy
        }
        cc.total = total;
    }
}

function collision(p1x, p1y, r1, p2x, p2y, r2, diff = 10) {
    let a, x, y;

    a = r1 + r2;
    x = p1x - p2x;
    y = p1y - p2y;

    return a + diff > Math.sqrt((x * x) + (y * y))
}

function createShape(type) {
    return {
        type: type,
        color: randomColor(),
        id: genId(),
    }
}

function spreadCircles() {
    let chance = R.random_choice([0, 0.5, 1])
    let trys = R.random_choice([250, 500, 1000])
    let minR = R.random_choice([25, 100])
    let maxR = 350
    for (let i = 0; i < trys; i++) {
        let r = R.random_num(minR, maxR - map(i, 0, trys, 0, maxR - minR));
        let x = R.random_num(0, DEFAULT_SIZE);
        let y = R.random_num(0, DEFAULT_SIZE);
        let draw_ = true;
        for (let j = 0; j < shapes.length; j++) {
            let check = shapes[j]
            if (check.type === 'circle' && collision(check.x, check.y, check.r, x, y, r, r * 2)) {
                draw_ = false;
            }
        }
        if (draw_) {
            let total = getOrphNumber()

            for (let i = 1; i <= total; i++) {
                if (R.random_bool(chance) && i === 1) {
                    let c = {
                        ...createShape('circle'),
                        x, y, r, total
                    };
                    shapes.push(c)
                    break;
                }
                let c = {
                    ...createShape('circle'),
                    x, y, r: i * (r / total), total
                };

                shapes.push(c)
            }
        }
    }
}

function linesBG(isStraight) {
    let types = ['left', 'right'];
    let multi1 = isStraight ? 1 : 1.42857142857;
    let multi2 = isStraight ? 1 : 2;
    let max = R.random_int(10, 25);
    let type = R.random_choice(types);
    let minS = () => { return R.random_choice([10, 50]) };
    let maxS = () => { return R.random_choice([250, 500]) };
    let smallLinesChange = 0.5
    let isMaxShapes = () => {
        const tt = (!isStraight ? 'triangle' : 'square');
        return shapes.filter(x => x.type === tt).length > max * multi2;
    }
    let getSmallLine = () => { return R.random_int(2, R.random_choice([5, 10]) * multi1) }
    let getSmallLines = () => { return !isMaxShapes() ? R.random_choice([0.1, 0.25, 0.5]) : R.random_choice([0.01, 0.05]) }
    let getSize = () => { return R.random_int(minS(), maxS()) * multi1; }
    let getSpace = () => { return R.random_choice([getSmallLine(), getSize() / 2]); }
    let smallLines = getSmallLines();
    let size = getSize();
    let start = -DEFAULT_SIZE;
    let end = DEFAULT_SIZE * 2;

    if (isStraight) {
        if (type === 'right') options.texture_dir = 'x'
        if (type === 'left') options.texture_dir = 'y'
        start = -R.random_num(10, 20);
        end = DEFAULT_SIZE;
    }

    for (let i = start; i < end;) {
        if (!isStraight) {
            const diff = DEFAULT_SIZE;
            if (type === 'left') {
                shapes.push({
                    p1: { x: DEFAULT_SIZE + diff, y: i },
                    p2: { x: DEFAULT_SIZE + diff, y: DEFAULT_SIZE + diff },
                    p3: { x: i, y: DEFAULT_SIZE + diff },
                    ...createShape('triangle'),
                });
                moveBit(null, 0.5, 2)
                shapes.push({
                    p1: { x: DEFAULT_SIZE + diff, y: i + size },
                    p2: { x: DEFAULT_SIZE + diff, y: DEFAULT_SIZE + diff },
                    p3: { x: i + size, y: DEFAULT_SIZE + diff },
                    ...createShape('triangle'),
                });
                moveBit(null, 0.5, 2)
            }
            if (type === 'right') {
                shapes.push({
                    p1: { x: -diff, y: -i },
                    p2: { x: DEFAULT_SIZE + i, y: DEFAULT_SIZE + diff },
                    p3: { x: -diff, y: DEFAULT_SIZE + diff },
                    ...createShape('triangle'),
                });
                moveBit(null, 0.5, 2)
                shapes.push({
                    p1: { x: -diff, y: -i - size },
                    p2: { x: DEFAULT_SIZE + i + size, y: DEFAULT_SIZE + diff },
                    p3: { x: -diff, y: DEFAULT_SIZE + diff },
                    ...createShape('triangle'),
                });
                moveBit(null, 0.5, 2)
            }
        }
        if (isStraight) {
            if (type === 'left') {
                shapes.push({
                    x: i,
                    y: -10,
                    w: size,
                    h: DEFAULT_SIZE + 20,
                    ...createShape('square'),
                })
                moveBit(null, 0.5, 2)
            }
            if (type === 'right') {
                shapes.push({
                    x: -10,
                    y: i,
                    w: DEFAULT_SIZE + 20,
                    h: size,
                    ...createShape('square'),
                })
                moveBit(null, 0.5, 2)
            }
        }

        i += size + getSpace();
        size = getSize()
        if (R.random_bool(smallLinesChange)) smallLines = getSmallLines();
        if (R.random_bool(smallLines)) size = getSmallLine()
    }
}

function fullRects() {
    const side = R.random_bool(0.5);
    const empty = R.random_bool(0.5)
    const fading = R.random_bool(0.5)
    options.texture_dir = side ? 'x' : 'y'
    options.grid = R.random_int(R.random_choice([2, 3]), 6);
    let count = 0;
    let num = 1;
    const numDown = R.random_num(0.5, 1)
    for (let r = 0; r < options.grid; r++) {
        if (R.random_bool(empty) && count > 0) continue;
        setOneShape(side ? r : 0, side ? 0 : r, 'rectangle', null, side);
        if (fading)
            getLastShape()[side ? 'h' : 'w'] *= num;

        num *= numDown
        count++;
    }
}

function getLastShape() {
    return shapes[shapes.length - 1];
}

function randomCell() {

    return R.random_int(1, options.grid) - 1
}

function genId() {
    return R.random_int(1, 999999999)
}

function setOneShape(r, c, shape_, size_, rect_) {
    let shape = shape_;

    let id = genId();
    let color = randomColor();
    intersections[id] = color

    switch (shape) {
        case 'circle':
            let cc = {
                ...getCirclePos(r, c),
                type: shape,
                color: color,
                id: id,
                total: 1
            };
            cc.r *= (size_ || 1)
            if (!circleExist(cc))
                shapes.push(cc);
            break;
        case 'triangle':
            let t = {
                ...getTrianglePos(r, c, size_),
                type: shape,
                color: color,
                id: id
            };
            shapes.push(t);
            break;
        case 'square':
        case 'rectangle':
            let size = getShapeSize() * (size_ || 0.8);
            let rectSize = DEFAULT_SIZE * (1 - options.frame_border * 2) - size * 0.25;
            let w = (shape === 'rectangle' && rect_ ? rectSize : size);
            let h = (shape === 'rectangle' && !rect_ ? rectSize : size);
            let ss = {
                ...getShapePos(r, c),
                w, h,
                type: shape,
                color: color,
                id: id
            };
            if (shape === 'square') {
                ss.x -= ss.w / 2;
                ss.y -= ss.h / 2;
            }
            if (shape === 'rectangle') {
                if (rect_) {
                    ss.y -= ss.h / 2;
                    ss.x -= size / 2;
                } else {
                    ss.x -= ss.w / 2;
                    ss.y -= size / 2;
                }
            }
            shapes.push(ss);
            break;
    }
    noStroke();
}

function roundBy(num, by) {
    return Math.round(num / by) * by;
}

function circleExist(circle) {
    for (let i = 0; i < shapes.length; i++) {
        let s = shapes[i];
        if (s.type === 'circle') {
            let fields = ['x', 'y', 'r']
            let found = 0;
            for (let j = 0; j < 3; j++) {
                let f = fields[j]
                if (roundBy(s[f], 5) === roundBy(circle[f], 5)) {
                    found++
                }
            }
            if (found === 3) return true;
        }
    }
    return false;
}

function moveBit(shape_, min, max) {
    const shape = { ...(shape_ || getLastShape()) };
    let m_ = () => { return R.random_num(min, max) };
    let s_ = (f) => { shape[f] *= m_(); }
    let k_ = (f, key) => { shape[key][f] *= m_(); }
    if (shape.type === 'triangle') {
        const key = `p${R.random_int(1, 3)}`
        if (R.random_bool(0.3333)) k_('x', key);
        else if (R.random_bool(0.5)) k_('y', key);
        else {
            k_('x', key);
            k_('y', key);
        }
    } else {
        if (R.random_bool(0.5)) shape.r *= m_();

        if (R.random_bool(0.3333)) s_('x');
        else if (R.random_bool(0.5)) s_('y');
        else {
            s_('x');
            s_('y');
        }

        if (R.random_bool(0.3333)) s_('w');
        else if (R.random_bool(0.5)) s_('h');
        else {
            s_('w');
            s_('h');
        }

    }
    return shape;
}

function drawOneShape(shape_, noFrame) {
    const isTri = shape_.type === 'triangle' ? 0.025 : 0;
    const isSmall = shape_.r < 50 ? 0.025 : 0;
    const less = isTri + isSmall;
    const difff = 0.05
    const shape = { ...moveBit(shape_, 1 - difff + less, 1 + difff - less) }
    let radius = 1 * M;

    switch (shape.type) {
        case 'circle':
            drawCircle(shape.x * M, shape.y * M, radius, shape.r, null, noFrame)
            break;
        case 'triangle':
            drawLine(radius, shape.p1.x, shape.p1.y, shape.p2.x, shape.p2.y, null, noFrame)
            drawLine(radius, shape.p1.x, shape.p1.y, shape.p3.x, shape.p3.y, null, noFrame)
            drawLine(radius, shape.p2.x, shape.p2.y, shape.p3.x, shape.p3.y, null, noFrame)
            break;
        case 'square':
        case 'rectangle':
            drawLine(radius, shape.x, shape.y, shape.x + shape.w, shape.y, null, noFrame)
            drawLine(radius, shape.x, shape.y, shape.x, shape.y + shape.h, null, noFrame)
            drawLine(radius, shape.x + shape.w, shape.y + shape.h, shape.x + shape.w, shape.y, null, noFrame)
            drawLine(radius, shape.x + shape.w, shape.y + shape.h, shape.x, shape.y + shape.h, null, noFrame)
            break;
    }
}

function isFrame(x, y, isCircle) {

    if (options.out_frame && isCircle) return false;

    const s = options.frame_border;
    const mm = isCircle ? M : 1;
    const min = DEFAULT_SIZE * s * mm;
    const max = DEFAULT_SIZE * (1 - s) * mm;
    const r = options.ratio;
    return x < min || x > max || y < min || y > max * r;
}

function drawLine(radius, x1, y1, x2, y2, pg, noFrame) {
    setRandomSketchColor()

    let d = dist(x1, y1, x2, y2);

    let draw = R.random_bool(0.5);
    let drawChange = R.random_num(0, options.draw_borders_change);

    for (let i = 0; i <= d; i++) {

        if (!pg) {
            if (R.random_bool(drawChange)) draw = !draw;
            if (!draw) continue;
        }

        let x = lerp(x1, x2, i / d);
        let y = lerp(y1, y2, i / d);

        if (noFrame && isFrame(x, y)) continue;

        if (pg) pg.arc(x, y, radius / M, radius / M, 0, TWO_PI);
        else arc(x * M, y * M, radius, radius, 0, TWO_PI);

        radius = manageRadius(radius, x, y);
    }
}

function drawCircle(a, b, radius, r, pg, noFrame, isPartial) {
    setRandomSketchColor()

    let angle = 0;
    let size = map(r, 0, DEFAULT_SIZE, 50, 5000);
    if (pg) size = 20
    r *= M
    let step = TWO_PI / size;
    if (pg) pg.translate(a, b);
    else translate(a, b);

    let draw = isPartial ? false : R.random_bool(0.5);
    let drawChange = R.random_num(0, options.draw_borders_change);

    for (let i = 0; i < size; i++) {

        let x = r * sin(angle);
        let y = r * cos(angle);

        angle = angle + step;

        if (noFrame && isFrame(a + x, b + y, true)) continue;
        if (R.random_bool(drawChange)) draw = !draw;
        if (!draw) continue;

        if (pg) pg.arc(x, y, radius, radius, 0, TWO_PI);
        else arc(x, y, radius, radius, 0, TWO_PI);
        radius = manageRadius(radius, x, y);
    }

    if (pg) pg.translate(-a, -b);
    else translate(-a, -b);
}

function manageRadius(radius, x, y) {
    let inc = 0.25 * M;
    if (R.random_bool(0.45) && radius < max_stroke * M) {
        radius += inc;
    } else if (radius > min_stroke * M) {
        radius -= inc;
    }

    // const isDouble = options.isDouble ? 2 : 1
    // if (R.random_bool(0.001 / isDouble)) {
    //     if (R.random_bool(0.5))
    //         drawA();
    //     else
    //         drawB();
    // }
    return radius;
}

async function shapesBorder(noFrame) {
    min_stroke = 0;
    max_stroke = 2;
    noStroke();
    const inter = Object.keys(intersections).length;
    const frameUp = noFrame ? R.random_num(2, 3) : 1;
    const bgDown = options.bgType ? 2 : 1;
    const typeDown = options.position_type.includes('dmitri') && inter > 250 && options.maxOrph > 5 ? 5 : 1
    const count = 5 * frameUp / (bgDown * typeDown);
    const count_ = Math.min(count, 20)
    for (let i = 0; i < count_; i++) {
        await waiter(1)
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i]
            drawOneShape(shape, noFrame)
        }
    }
}

function setRandomSketchColor(o) {
    const s_ = R.random_int(100, 205)
    const o_ = R.random_num(0.2, 0.4)
    fill(`rgba(${s_},${s_},${s_},${o || o_})`);
}

function setOrphLines() {
    if (!options.is_diagonal) {
        if (options.orph_side === 'h') options.texture_dir = 'x';
        if (options.orph_side === 'v') options.texture_dir = 'y';
    }

    let circles = shapes.filter(x => x.type === 'circle')
    let side = options.orph_side
    let count = side === 'hv' ? 10 : 25;
    if (circles.length) {
        let isDiagonal = options.is_diagonal;
        for (let i = 0; i < R.random_int(3, count); i++) {
            let c = R.random_choice(circles)
            drawOrphLines(c.x, c.y, ['v', 'hv'].includes(side), ['h', 'hv'].includes(side), isDiagonal)
        }
    }
}

function setBG() {
    options.grid = 1;
    setOneShape(0, 0, 'square', 10)
    let shape = getLastShape();
    let c = randomColor(true)
    shape.color = c;
    intersections[shape.id] = c;
    shape.bg = true;
}

function getDiffShape() {
    return R.random_num(2, options.doubleMax)
}

function doubleShapes() {
    const diffx = getDiffShape()
    const diffy = getDiffShape()
    const shapes_ = [];
    for (const shape of shapes) {
        const sizeX = (options.isDoubleType ? diffx : getDiffShape());
        const sizeY = (options.isDoubleType ? diffy : getDiffShape());
        shapes_.push({
            ...shape,
            ...createShape(shape.type),
            x: shape.x + sizeX,
            y: shape.y + sizeY,
        })
    }
    shapes.push(...shapes_)
}

function randomSketching() {
    let radius = 1 * M;
    for (let index = 0; index < R.random_int(500, 1000); index++) {
        drawA();
    }

    for (let index = 0; index < R.random_int(2500, 5000); index++) {
        drawB();
    }
}

function drawB() {
    const radius = 1 * M;
    const x_ = R.random_num(0, DEFAULT_SIZE)
    const y_ = R.random_num(0, DEFAULT_SIZE)
    if (R.random_bool(0.5)) drawDirt(radius, x_, y_);
    else drawSin(radius, x_, y_);
}

function drawA() {
    const radius = 1 * M;
    const diff = R.random_num(0, 50)
    const a_ = (a) => { return R.random_num(a - diff, a + diff) }
    const x_ = R.random_num(0, DEFAULT_SIZE)
    const y_ = R.random_num(0, DEFAULT_SIZE)
    if (R.random_bool(0.75)) drawLine(radius, a_(x_), a_(y_), a_(x_), a_(y_))
    else drawCircle(x_ * M, y_ * M, 1 * M, R.random_num(0, 20), null, null, true);
}

function drawSin(radius, x, y) {
    setRandomSketchColor(0.05)

    const d = R.random_num(10, 25)
    const amp = R.random_num(5, 20)
    const dirx = R.random_choice([-1, 1])
    const diry = R.random_choice([-1, 1])

    for (let i = 0; i <= d; i++) {
        x += i * dirx;
        y += sin(x) * amp * diry

        arc(x * M, y * M, radius, radius, 0, TWO_PI);

        radius = manageRadius(radius, x, y);
    }
}

function drawDirt(radius, x, y) {
    setRandomSketchColor(0.05)

    const d = R.random_num(10, 25)

    for (let i = 0; i <= d; i++) {

        x += R.random_num(-1, 1);
        y += R.random_num(-1, 1);

        arc(x * M, y * M, radius, radius, 0, TWO_PI);

        radius = manageRadius(radius, x, y);
    }
}

function changePositions() {
    const diffCircle = DEFAULT_SIZE * options.maxChangePositionCircle / options.ratio;
    const diffSec = DEFAULT_SIZE * options.maxChangePositionSec / options.ratio;

    const getD = (isCircle) => {
        let d = isCircle ? diffCircle : diffSec;
        return R.random_num(-d, d);
    }

    let sizex = getD(R.random_bool(0.5));
    let sizey = getD(R.random_bool(0.5));
    for (const s of shapes) {
        const isCircle_ = s.type === 'circle';
        const isSec = !isCircle_ && options.changeSecPosition;
        const isCircle = isCircle_ && options.changeCirclePosition;
        if (s.bg) continue;
        if (options.changePosition2 && (isSec || isCircle)) {
            sizex = getD(isCircle_) / R.random_num(2, 10);
            sizey = getD(isCircle_) / R.random_num(2, 10);
        }
        changePos(s, sizex, sizey);
    }
}

function changePos(s, sizex, sizey) {
    s.x += sizex;
    s.y += sizey;
    if (s.type === 'triangle') {
        s.p1.x += sizex;
        s.p2.x += sizex;
        s.p3.x += sizex;

        s.p1.y += sizey;
        s.p2.y += sizey;
        s.p3.y += sizey;
    }
}

function fixRatioShapesPos() {
    for (const s of shapes) {
        if (s.square_bg) continue;
        const size = (DEFAULT_SIZE - DEFAULT_SIZE * options.ratio) / 2;
        s.y += size
        if (s.type === 'triangle') {
            s.p1.y += size
            s.p2.y += size
            s.p3.y += size
        }
    }
}

function setDouble() {
    if (options.isDouble && !['portal', 'sonia', 'sonia_orph'].includes(options.position_type)) doubleShapes();
}

function setAllShapes() {
    const doubleType = R.random_bool(0.5)
    setBG();
    setFrameShapes();
    if (options.isMainDouble && !['dmitri_b', 'dmitri_c', 'sonia', 'sonia_orph', 'portal'].includes(options.position_type))
        setFrameShapes();
    else options.isMainDouble = false;
    if (doubleType)
        setDouble();
    if (options.changePosition) changePositions();
    fixRatioShapesPos();
    if (!doubleType)
        setDouble();
}

function setLessShapes() {
    const len = shapes.length;
    const remove = Math.floor(R.random_num(0, len * 0.25));
    for (let index = 0; index < remove; index++) {
        const shape = R.random_choice(shapes);
        if (shape.type === 'circle' && shapes.filter(x => x.type === 'circle').length === 1) continue;
        if (shape.bg) continue;
        shapes = shapes.filter(x => x.id !== shape.id)
    }
}

function circlesInScreen() {
    const circles = shapes.filter(c => c.type === 'circle');
    const maxX = DEFAULT_SIZE;
    const maxY = DEFAULT_SIZE * options.ratio;
    const mm = 0;
    return circles.some(c => {
        const xIn = (c.x - c.r > mm) && (c.x + c.r < maxX - mm);
        const yIn = (c.y - c.r > mm) && (c.y + c.r < maxY - mm);
        return xIn && yIn;
    })
}

function stopDraw(shape, x, y, s) {
    if (Array.isArray(shape)) {
        if (!shape.some(x => x.type === 'circle')) {
            const ss = DEFAULT_SIZE * s;
            const ss2 = DEFAULT_SIZE * (1 - s);
            if (x < ss || y < ss || y > ss2 * options.ratio || x > ss2) return true;
        }
    }
    return false;
}

async function waiter(timeout){
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve();
        }, timeout);
    })
}

async function start_() {
    setAllShapes();
    if (options.less) setLessShapes();

    if (!circlesInScreen()) {
        const savedRatio = options.ratio;
        colors = {};
        shapes = [];
        setProps();
        options.ratio = savedRatio;
        colors.pattern = createPatterns();
        setCanvasBG();
        start_();
        return;
    }

    await shapesBorder();
    randomSketching();
    noStroke();

    const s = options.frame_border;
    let start = DEFAULT_SIZE * s;
    let end = DEFAULT_SIZE * (1 - s);
    let ratio = options.ratio;
    if (options.out_frame) {
        start = 0;
        end = DEFAULT_SIZE;
        ratio = 1;
    }
    const do_ = {
        draw_inc: 0.5,
        size: 0.99 * M * (M > 1 ? 1.2 : 1)
    }
    for (let y = start; y < end * ratio; y += do_.draw_inc) {

        if(R.random_bool(0.5)) await waiter(1);
            for (let x = start; x < end; x += do_.draw_inc) {

                let { c, id, shape } = setColors(x, y);

                helper[`${x}_${y}`] = { c, id, shape };

                if (c === 'BLANK') continue;

                if (R.random_bool(options.stroke) || c === bg) continue;

                if (options.out_frame && stopDraw(shape, x, y, s)) continue;

                if (shape === 'stop') continue;

                if (isColor(c)) rect(x * M, y * M, do_.size, do_.size)
                else image(c, x * M, y * M, do_.size, do_.size, x, y, do_.size / M, do_.size / M)

                state.color++;
            }
    }
        if (options.shapes_border) {


            for (let y = start; y < end * ratio; y += do_.draw_inc) {

                    for (let x = start; x < end; x += do_.draw_inc) {
                        if (R.random_bool(options.stroke)) continue;
                        let { c, id, shape } = helper[`${x}_${y}`];

                        if (options.out_frame && stopDraw(shape, x, y, s)) continue;

                        if (shape === 'stop') continue;
                        if (c === 'BLANK') continue;
                        let pos = intersectionsSizes[id];
                        let opacity = map(y, pos.yMin, pos.yMax, pos.min1, pos.max1);
                        if (options.texture_dir === 'x') opacity = map(x, pos.xMin, pos.xMax, pos.min1, pos.max1);
                        if (pos.reverse) opacity = (1 - opacity);
                        let mm = R.random_num(0.9, 1.1);
                        let c_ = color('#111');
                        c_.setAlpha(opacity * 255 * (intersections[id] !== bg ? options.colors_grain : 1) * mm)
                        fill(c_)
                        rect(x * M, y * M, do_.size, do_.size)

                        if (c_.levels[3] > 50) state.grain++;

                    }
            }

            console.log(`color ${state.color}`)

            console.log(`grain ${state.grain}`)

            shapesBorder(true);
            randomSketching();
            console.log(options)

            setMetadataAndComplete();
                // save(window.params.seed + '.jpeg');
                // setTimeout(() => {
                //     location.reload();
                // }, 100)
        }
}

function saveIntersectionSizes(x, y, id) {
    if (!intersectionsSizes[id]) {
        intersectionsSizes[id] = {
            xMin: Infinity,
            xMax: 0,
            yMin: Infinity,
            yMax: 0,
            color: randomColor(),
            bg: false,
            min1: 0,
            max1: R.random_num(options.texture_max, 1),
            reverse: options.texture_dir_reverse_static ? options.texture_dir_reverse : R.random_bool(0.5),
        }
    } else {
        let item = intersectionsSizes[id];
        if (x < item.xMin) item.xMin = x;
        if (x > item.xMax) item.xMax = x;
        if (y < item.yMin) item.yMin = y;
        if (y > item.yMax) item.yMax = y;
    }
}

function isColor(c) {
    return typeof c === 'string' || c.mode === 'rgb'
}

function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function isPointInTriangle(pt, v1, v2, v3) {
    let d1, d2, d3, has_neg, has_pos;

    d1 = sign(pt, v1, v2);
    d2 = sign(pt, v2, v3);
    d3 = sign(pt, v3, v1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

function isPointInCircle(x, y, shape) {
    return dist(x, y, shape.x, shape.y) < shape.r;
}

function isPointInSquare(x, y, shape) {

    return shape.x <= x && x <= shape.x + shape.w &&
        shape.y <= y && y <= shape.y + shape.h;
}

function isShapeCollide(x, y) {
    let res = [];
    for (let i = 0; i < shapes.length; i++) {
        let shape = shapes[i];

        if (shape.type === 'circle')
            if (isPointInCircle(x, y, shape))
                res.push(shape);

        if (['square', 'rectangle'].includes(shape.type))
            if (isPointInSquare(x, y, shape))
                res.push(shape);

        if (shape.type === 'triangle')
            if (isPointInTriangle({ x, y }, shape.p1, shape.p2, shape.p3))
                res.push(shape);
    }
    if (res.length > 0) return res;
    return 'stop';
}

function setColors(x, y) {
    let shape = isShapeCollide(x, y);
    if (shape === 'stop') return { shape };
    let id = saveIntersection(shape);
    let c = intersections[id];
    saveIntersectionSizes(x, y, id);
    if (c === bg && intersectionsSizes[id].bg) {
        c = intersectionsSizes[id].color;
    }
    if (isColor(c)) fill(c)
    return { c, id, shape }
}

function saveIntersection(arr) {
    let id = arr.map(x => x.id).sort((a, b) => { return a - b }).join('_');
    if (!intersections[id]) {
        intersections[id] = randomColor()
    }
    return id;
}