import removeLocalised from "./remove-localised";

describe("removeLocalised", () => {
  it("should remove all entries ending with _Localised", () => {
    const testObject = {
      foo: "this is fine",
      bar: "this is fine",
      foo_Localised: "this is not fine",
      bar_Localised: "this is not fine",
      foo_Localised_bar: "this is fine",
      _Localised_foo: "this is fine"
    };

    expect(removeLocalised(testObject)).toEqual({
      foo: "this is fine",
      bar: "this is fine",
      foo_Localised_bar: "this is fine",
      _Localised_foo: "this is fine"
    });
  });

  it("should remove all nested entries ending with _Localised", () => {
    const testObject = {
      foo: {
        bar: "this is fine",
        foo_Localised: "this is not fine",
        bar_Localised: "this is not fine",
        foo_Localised_bar: "this is fine",
        _Localised_foo: "this is fine"
      },
      bar: "this is fine",
      foo_Localised: "this is not fine",
      bar_Localised: "this is not fine",
      foo_Localised_bar: "this is fine",
      _Localised_foo: "this is fine"
    };

    expect(removeLocalised(testObject)).toEqual({
      foo: {
        bar: "this is fine",
        foo_Localised_bar: "this is fine",
        _Localised_foo: "this is fine"
      },
      bar: "this is fine",
      foo_Localised_bar: "this is fine",
      _Localised_foo: "this is fine"
    });
  });

  it("should remove _Localised props for objects within Arrays", () => {
    const testObject = {
      foo: {
        bar: "this is fine",
        foo_Localised: "this is not fine",
        bar_Localised: "this is not fine",
        foo_Localised_bar: "this is fine",
        _Localised_foo: "this is fine"
      },
      bar: "this is fine",
      foo_Localised: "this is not fine",
      bar_Localised: "this is not fine",
      foo_Localised_bar: "this is fine",
      _Localised_foo: "this is fine",
      anArray: [
        "foo",
        "bar",
        "_Localised",
        {
          foo: {
            bar: "this is fine",
            foo_Localised: "this is not fine",
            bar_Localised: "this is not fine",
            foo_Localised_bar: "this is fine",
            _Localised_foo: "this is fine"
          },
          bar: "this is fine",
          foo_Localised: "this is not fine",
          bar_Localised: "this is not fine",
          foo_Localised_bar: "this is fine",
          _Localised_foo: "this is fine"
        }
      ]
    };

    expect(removeLocalised(testObject)).toEqual({
      foo: {
        bar: "this is fine",
        foo_Localised_bar: "this is fine",
        _Localised_foo: "this is fine"
      },
      bar: "this is fine",
      foo_Localised_bar: "this is fine",
      _Localised_foo: "this is fine",
      anArray: [
        "foo",
        "bar",
        "_Localised",
        {
          foo: {
            bar: "this is fine",
            foo_Localised_bar: "this is fine",
            _Localised_foo: "this is fine"
          },
          bar: "this is fine",
          foo_Localised_bar: "this is fine",
          _Localised_foo: "this is fine"
        }
      ]
    });
  });
});
