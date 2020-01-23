
// My Only Changes

function start () {
  // 1. Disable window scrolling with arrow keys, since they're required for movement
  window.addEventListener('keydown', (e) => {
    if (e.keyCode == Keys.UP ||
        e.keyCode == Keys.DOWN ||
        e.keyCode == Keys.LEFT ||
        e.keyCode == Keys.RIGHT)
      e.preventDefault();
  });
  // 2. Initialize the Tabs
  $('.tabs').tabs();
}

$(start);
