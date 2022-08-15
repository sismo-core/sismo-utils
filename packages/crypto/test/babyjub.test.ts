import { Scalar } from "ffjavascript";
import { expect } from "chai";
import { BabyJub, buildBabyjub } from "../src/babyJub";
import { FiniteField } from "../src/field";
import { Point } from "../src/point";

describe("Baby Jub test", function () {
  let babyjub: BabyJub;
  let F: FiniteField;

  beforeAll(async () => {
    babyjub = await buildBabyjub();
    F = babyjub.F;
  });

  it("Should add point (0,1) and (0,1)", () => {
    const p1 = new Point(F.e(0), F.e(1));
    const p2 = new Point(F.e(0), F.e(1));

    const out = babyjub.addPoint(p1, p2);
    expect(out.x).to.deep.equal(F.zero);
    expect(out.y).to.deep.equal(F.one);
  });

  it("Should base8 be 8*generator", () => {
    let res: Point;
    res = babyjub.addPoint(babyjub.Generator, babyjub.Generator);
    res = babyjub.addPoint(res, res);
    res = babyjub.addPoint(res, res);

    expect(res.x).to.deep.equal(babyjub.Base8.x);
    expect(res.y).to.deep.equal(babyjub.Base8.y);
  });

  it("Should add 2 same points", () => {
    const p1 = new Point(
      F.e(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268"
      ),
      F.e(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475"
      )
    );
    const p2 = new Point(
      F.e(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268"
      ),
      F.e(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475"
      )
    );

    const out = babyjub.addPoint(p1, p2);
    expect(out.x).to.deep.equal(
      F.e(
        "6890855772600357754907169075114257697580319025794532037257385534741338397365"
      )
    );
    expect(out.y).to.deep.equal(
      F.e(
        "4338620300185947561074059802482547481416142213883829469920100239455078257889"
      )
    );
  });

  it("Should add 2 different points", () => {
    const p1 = new Point(
      F.e(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268"
      ),
      F.e(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475"
      )
    );
    const p2 = new Point(
      F.e(
        "16540640123574156134436876038791482806971768689494387082833631921987005038935"
      ),
      F.e(
        "20819045374670962167435360035096875258406992893633759881276124905556507972311"
      )
    );

    const out = babyjub.addPoint(p1, p2);
    expect(out.x).to.deep.equal(
      F.e(
        "7916061937171219682591368294088513039687205273691143098332585753343424131937"
      )
    );

    expect(out.y).to.deep.equal(
      F.e(
        "14035240266687799601661095864649209771790948434046947201833777492504781204499"
      )
    );
  });

  it("should use mulPointEscalar0", () => {
    const p = new Point(
      F.e(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268"
      ),
      F.e(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475"
      )
    );

    const r = babyjub.mulPointEscalar(p, BigInt("3"));
    let r2 = babyjub.addPoint(p, p);
    r2 = babyjub.addPoint(r2, p);

    expect(r2.x).to.deep.equal(r.x);
    expect(r2.y).to.deep.equal(r.y);

    expect(r.x).to.deep.equal(
      F.e(
        "19372461775513343691590086534037741906533799473648040012278229434133483800898"
      )
    );
    expect(r.y).to.deep.equal(
      F.e(
        "9458658722007214007257525444427903161243386465067105737478306991484593958249"
      )
    );
  });

  it("should use mulPointEscalar for others points", () => {
    const p = new Point(
      babyjub.F.e(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268"
      ),
      babyjub.F.e(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475"
      )
    );

    const r = babyjub.mulPointEscalar(
      p,
      Scalar.fromString(
        "14035240266687799601661095864649209771790948434046947201833777492504781204499"
      )
    );

    expect(r.x).to.deep.equal(
      F.e(
        "17070357974431721403481313912716834497662307308519659060910483826664480189605"
      )
    );
    expect(r.y).to.deep.equal(
      F.e(
        "4014745322800118607127020275658861516666525056516280575712425373174125159339"
      )
    );
  });

  it("should use mulPointEscalar for an other points again", () => {
    const p = new Point(
      babyjub.F.e(
        "6890855772600357754907169075114257697580319025794532037257385534741338397365"
      ),
      babyjub.F.e(
        "4338620300185947561074059802482547481416142213883829469920100239455078257889"
      )
    );

    const r = babyjub.mulPointEscalar(
      p,
      Scalar.fromString(
        "20819045374670962167435360035096875258406992893633759881276124905556507972311"
      )
    );
    expect(r.x).to.deep.equal(
      F.e(
        "13563888653650925984868671744672725781658357821216877865297235725727006259983"
      )
    );
    expect(r.y).to.deep.equal(
      F.e(
        "8442587202676550862664528699803615547505326611544120184665036919364004251662"
      )
    );
  });

  it("should verify inCurve", () => {
    const p = new Point(
      babyjub.F.e(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268"
      ),
      babyjub.F.e(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475"
      )
    );
    expect(babyjub.inCurve(p)).to.equal(true);
  });

  it("should verify inCurve for an other point", () => {
    const p = new Point(
      babyjub.F.e(
        "6890855772600357754907169075114257697580319025794532037257385534741338397365"
      ),
      babyjub.F.e(
        "4338620300185947561074059802482547481416142213883829469920100239455078257889"
      )
    );
    expect(babyjub.inCurve(p)).to.equal(true);
  });
});
