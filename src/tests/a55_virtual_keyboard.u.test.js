const a55vkb = require('./../../ext/arcanus55/js/a55_virtual_keyboard.js');

test("Option audio is on", () => {
    a55vkb.options.setState("audio", true );
    expect( a55vkb.options.getState("audio") ).toBe( true );
});
test("Option audio is Click Sounds", () => {
    expect( a55vkb.options.getFeedback("audio") ).toBe( "Click Sounds" );
})
test("Option array to contain audio", () => {
    expect( a55vkb.options.aOpts ).toContainEqual( ["audio", true, "Click Sounds"] );
})