var jgui;
(function (jgui) {
    (function (ButtonState) {
        ButtonState[ButtonState["Normal"] = 0] = "Normal";
        ButtonState[ButtonState["Down"] = 1] = "Down";
    })(jgui.ButtonState || (jgui.ButtonState = {}));
    var ButtonState = jgui.ButtonState;
})(jgui || (jgui = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jgui;
(function (jgui) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(width, height, color1, color2) {
            _super.call(this);
            this.moveTo(0, 0);
            this.width = width;
            this.height = height;
            this.enablePointingEvent();
            this.pointDown.handle(this, this.onPointDown);
            this.pointMove.handle(this, this.onPointMove);
            this.pointUp.handle(this, this.onPointUp);
            this.createBg(color1, color2);
            this.state = jgui.ButtonState.Normal;
            this.click = new jg.Trigger();
        }
        Button.prototype._createBg = function (color) {
            var canvas = window.createCanvas(this.width, this.height);
            var ctx = canvas.getContext("2d");
            ctx.beginPath();
            var w = this.width;
            var h = this.height;
            var r = 8;
            ctx.arc(r, r, r, -Math.PI, -0.5 * Math.PI, false);
            ctx.arc(w - r, r, r, -0.5 * Math.PI, 0, false);
            ctx.arc(w - r, h - r, r, 0, 0.5 * Math.PI, false);
            ctx.arc(r, h - r, r, 0.5 * Math.PI, Math.PI, false);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            return canvas;
        };

        Button.prototype.createBg = function (color1, color2) {
            if (!color1) {
                color1 = jg.JGUtil.createLinearGradient(new jg.Rectangle(this.width / 2, 0, this.width / 2, this.height), ["rgba(240,240,255,1)", "rgba(80, 120, 190, 1)"]);
            }
            if (!color2) {
                color2 = jg.JGUtil.createLinearGradient(new jg.Rectangle(this.width / 2, 0, this.width / 2, this.height), ["rgba(240,240,255,1)", "rgba(240,240,255,1)", "rgba(80, 120, 190, 1)"], [0, 0.1, 1]);
            }
            this.bg1 = this._createBg(color1);
            this.bg2 = this._createBg(color2);
        };

        Button.prototype.onPointDown = function (e) {
            this.stateChange(jgui.ButtonState.Down);
        };

        Button.prototype.onPointMove = function (e) {
            if (this.hitTest(e.point))
                this.stateChange(jgui.ButtonState.Down);
else
                this.stateChange(jgui.ButtonState.Normal);
        };

        Button.prototype.onPointUp = function (e) {
            this.stateChange(jgui.ButtonState.Normal);

            if (this.hitTest(e.point))
                this.click.fire(this);
        };

        Button.prototype.stateChange = function (state) {
            if (this.state != state) {
                this.state = state;
                this.updated();
            }
        };

        Button.prototype.draw = function (context) {
            var img;
            img = (this.state == jgui.ButtonState.Normal) ? this.bg1 : this.bg2;
            context.drawImage(img, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        };
        return Button;
    })(jg.E);
    jgui.Button = Button;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var TextButton = (function (_super) {
        __extends(TextButton, _super);
        function TextButton(text, width, height, color1, color2) {
            _super.call(this, width, height, color1, color2);
            this.label = new jg.Label(text);
            this.label.setMaxWidth(this.width);
            this.label.setTextAlign("center");
            this.label.setTextBaseline("middle");
            this.entities = [];
            this.append(this.label);
            this.label.moveTo(this.width / 2, this.height / 2);
        }
        TextButton.prototype.getText = function () {
            return this.label.text;
        };
        TextButton.prototype.setText = function (text) {
            this.label.setText(text);
        };

        TextButton.prototype.stateChange = function (state) {
            if (this.state != state) {
                if (this.state == jgui.ButtonState.Down) {
                    this.label.y -= 2;
                } else {
                    this.label.y += 2;
                }
                _super.prototype.stateChange.call(this, state);
            }
        };
        return TextButton;
    })(jgui.Button);
    jgui.TextButton = TextButton;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var Focus = (function (_super) {
        __extends(Focus, _super);
        function Focus() {
            _super.call(this);
            this.color = "#ffff00";
        }
        Focus.prototype.focus = function (target) {
            this.target = target;
            if (target) {
                this.x = target.x;
                this.y = target.y;
                if (target.parent != this.parent) {
                    if (this.parent)
                        this.remove();
                    target.parent.append(this);
                }
                this.width = target.width;
                this.height = target.height;
            }
            this.updated();
        };

        Focus.prototype.draw = function (context) {
            if (!this.target)
                return;
            this.scene.game.renderer.useDrawOption(this.target, context);
            context.beginPath();
            context.strokeStyle = this.color;
            context.lineWidth = 3;
            context.rect(0, 0, this.target.width, this.target.height);
            context.stroke();
        };
        return Focus;
    })(jg.E);
    jgui.Focus = Focus;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var FocusManager = (function () {
        function FocusManager(game) {
            this.entities = [];
            this.game = game;
            this.current = null;
            this.selected = new jg.Trigger();
            this.changed = new jg.Trigger();
            this.focusIndex = -1;
        }
        FocusManager.prototype.addEntity = function () {
            var e = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                e[_i] = arguments[_i + 0];
            }
            for (var i = 0; i < e.length; i++) {
                if ((e[i]).setFocusEntities)
                    (e[i]).setFocusEntities(this);
else
                    this.entities.push(e[i]);
            }
        };

        FocusManager.prototype.removeEntity = function () {
            var e = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                e[_i] = arguments[_i + 0];
            }
            var entities = [];
            for (var i = 0, j; i < this.entities.length; i++) {
                for (j = 0; j < e.length; j++) {
                    if (this.entities[i] == e[j]) {
                        break;
                    }
                }
                if (j == e.length)
                    entities.push(this.entities[i]);
            }
            this.entities = entities;
            if (this.focusIndex >= this.entities.length) {
                if (this.entities.length == 0)
                    this.focusIndex = -1;
else
                    this.focusIndex = 0;
                this.updateFocus();
            }
        };

        FocusManager.prototype.clearEntity = function () {
            this.entities = [];
        };

        FocusManager.prototype.setFocus = function (e) {
            for (var i = 0; i < this.entities.length; i++) {
                if (e == this.entities[i]) {
                    this.focusIndex = i;
                    this.updateFocus();
                    break;
                }
            }
        };

        FocusManager.prototype.updateFocus = function () {
            var old = this.current;
            if (this.focusIndex == -1)
                delete this.current;
else
                this.current = this.entities[this.focusIndex];
            this.focus.focus(this.current);
            this.changed.fire({
                old: old,
                current: this.current
            });
        };

        FocusManager.prototype.start = function (focus) {
            this.game.keyDown.handle(this, this.onKeyDown);
            this.focus = focus === undefined ? new jgui.Focus() : focus;
            this.game.scene.append(this.focus);
            this.updateFocus();
        };

        FocusManager.prototype.end = function () {
            this.game.keyDown.remove(this, this.onKeyDown);
            if (this.focus.parent)
                this.focus.remove();
        };

        FocusManager.prototype.onKeyDown = function (e) {
            switch (e.key) {
                case jg.Keytype.Left:
                case jg.Keytype.Up:
                    this.focusIndex--;
                    if (this.focusIndex < 0)
                        this.focusIndex = this.entities.length - 1;
                    this.updateFocus();
                    break;
                case jg.Keytype.Right:
                case jg.Keytype.Down:
                    this.focusIndex++;
                    if (this.focusIndex >= this.entities.length)
                        this.focusIndex = 0;
                    this.updateFocus();
                    break;
                case jg.Keytype.Enter:
                    if (this.focus.target)
                        this.selected.fire(this.focus.target);
                    break;
            }
        };
        return FocusManager;
    })();
    jgui.FocusManager = FocusManager;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var Arrow = (function (_super) {
        __extends(Arrow, _super);
        function Arrow() {
            _super.apply(this, arguments);
        }
        Arrow.prototype._createBg = function (color) {
            var canvas = window.createCanvas(this.width, this.height);
            var ctx = canvas.getContext("2d");
            ctx.beginPath();
            var w = this.width;
            var h = this.height;
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w / 2, 0);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            return canvas;
        };

        Arrow.prototype.draw = function (context) {
            var img, y;
            if (this.state == jgui.ButtonState.Normal) {
                img = this.bg1;
                y = 0;
            } else {
                img = this.bg2;
                y = Math.max(this.height * 0.1, 2);
            }

            context.drawImage(img, 0, 0, this.width, this.height, 0, 0 + y, this.width, this.height - y);
        };
        return Arrow;
    })(jgui.Button);
    jgui.Arrow = Arrow;

    var DownArrow = (function (_super) {
        __extends(DownArrow, _super);
        function DownArrow() {
            _super.apply(this, arguments);
        }
        DownArrow.prototype._createBg = function (color) {
            var bg = _super.prototype._createBg.call(this, color);
            var canvas = window.createCanvas(this.width * 2, this.height * 2);
            var ctx = canvas.getContext("2d");
            ctx.save();
            ctx.translate(this.width, this.height);
            ctx.rotate(180 * (Math.PI / 180));
            ctx.drawImage(bg, 0, 0);
            ctx.restore();
            return canvas;
        };

        DownArrow.prototype.draw = function (context) {
            var img, y;
            if (this.state == jgui.ButtonState.Normal) {
                img = this.bg1;
                y = 0;
            } else {
                img = this.bg2;
                y = Math.max(this.height * 0.1, 2);
            }

            context.drawImage(img, 0, 0, this.width, this.height, 0, 0, this.width, this.height - y);
        };
        return DownArrow;
    })(Arrow);
    jgui.DownArrow = DownArrow;

    var UpArrow = (function (_super) {
        __extends(UpArrow, _super);
        function UpArrow() {
            _super.apply(this, arguments);
        }
        return UpArrow;
    })(Arrow);
    jgui.UpArrow = UpArrow;

    var LeftArrow = (function (_super) {
        __extends(LeftArrow, _super);
        function LeftArrow() {
            _super.apply(this, arguments);
        }
        LeftArrow.prototype._createBg = function (color) {
            var w = this.width;
            var h = this.height;
            this.width = h;
            this.height = w;
            var bg = _super.prototype._createBg.call(this, color);
            this.width = w;
            this.height = h;

            var canvas = window.createCanvas(this.width * 2, this.height * 2);
            var ctx = canvas.getContext("2d");
            ctx.save();
            ctx.translate(0, this.height);
            ctx.rotate(-90 * (Math.PI / 180));
            ctx.drawImage(bg, 0, 0);
            ctx.restore();
            return canvas;
        };

        LeftArrow.prototype.draw = function (context) {
            var img, y;
            if (this.state == jgui.ButtonState.Normal) {
                img = this.bg1;
                y = 0;
            } else {
                img = this.bg2;
                y = Math.max(this.height * 0.1, 2);
            }

            context.drawImage(img, 0, 0, this.width, this.height, y, 0, this.width - y, this.height);
        };
        return LeftArrow;
    })(Arrow);
    jgui.LeftArrow = LeftArrow;

    var RightArrow = (function (_super) {
        __extends(RightArrow, _super);
        function RightArrow() {
            _super.apply(this, arguments);
        }
        RightArrow.prototype._createBg = function (color) {
            var w = this.width;
            var h = this.height;
            this.width = h;
            this.height = w;
            var bg = _super.prototype._createBg.call(this, color);
            this.width = w;
            this.height = h;

            var canvas = window.createCanvas(this.width * 2, this.height * 2);
            var ctx = canvas.getContext("2d");
            ctx.save();
            ctx.translate(this.width, 0);
            ctx.rotate(90 * (Math.PI / 180));
            ctx.drawImage(bg, 0, 0);
            ctx.restore();
            return canvas;
        };

        RightArrow.prototype.draw = function (context) {
            var img, y;
            if (this.state == jgui.ButtonState.Normal) {
                img = this.bg1;
                y = 0;
            } else {
                img = this.bg2;
                y = Math.max(this.height * 0.1, 2);
            }

            context.drawImage(img, 0, 0, this.width, this.height, 0, 0, this.width - y, this.height);
        };
        return RightArrow;
    })(Arrow);
    jgui.RightArrow = RightArrow;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var BorderLabel = (function (_super) {
        __extends(BorderLabel, _super);
        function BorderLabel(text, fontSize, fontColor, baseline) {
            this.padding = new jg.Rectangle(4, 4, 4, 4);
            _super.call(this, text, fontSize, fontColor, baseline);
            this.setBorder(["#ABADB3", "#E2E3EA", "#E2E3EA", "#E2E3EA"]);
        }
        BorderLabel.prototype.setPadding = function (padding) {
            this.padding = padding;
            this.updateSize();
        };

        BorderLabel.prototype.setBackground = function (background) {
            this.setBorder(this.border_color, background);
        };

        BorderLabel.prototype.setFixWidth = function (width) {
            this.fix_width = width;
            this.updateSize();
        };

        BorderLabel.prototype.setBorder = function (color, background) {
            this.border_color = color;
            var canvas = window.createCanvas(this.width, this.height);
            var c = canvas.getContext("2d");

            if (background) {
                if (background instanceof HTMLCanvasElement || background instanceof HTMLImageElement) {
                    c.drawImage(background, 0, 0, background.width, background.height, 0, 0, this.width, this.height);
                } else {
                    c.beginPath();
                    c.fillStyle = background;
                    c.fillRect(0, 0, this.width, this.height);
                }
                this.background = background;
            }

            c.lineWidth = 2;
            if (this.border_color instanceof Array) {
                c.beginPath();
                c.strokeStyle = this.border_color[0];
                c.moveTo(0, 0);
                c.lineTo(this.width, 0);
                c.stroke();

                c.beginPath();
                c.strokeStyle = this.border_color[1];
                c.moveTo(this.width, 0);
                c.lineTo(this.width, this.height);
                c.stroke();

                c.beginPath();
                c.strokeStyle = this.border_color[2];
                c.moveTo(this.width, this.height);
                c.lineTo(0, this.height);
                c.stroke();

                c.beginPath();
                c.strokeStyle = this.border_color[3];
                c.moveTo(0, this.height);
                c.lineTo(0, 0);
                c.stroke();
            } else if (this.border_color) {
                c.beginPath();
                c.strokeStyle = this.border_color;
                c.rect(0, 0, this.width, this.height);
                c.stroke();
            }
            this.border = canvas;
            this.updated();
        };

        BorderLabel.prototype.updateSize = function () {
            _super.prototype.updateSize.call(this);
            if (this.fix_width)
                this.width = this.fix_width;
            this.width += this.padding.left + this.padding.right;
            this.height += this.padding.top + this.padding.bottom;
            this.setBorder(this.border_color, this.background);
        };

        BorderLabel.prototype.draw = function (context) {
            context.drawImage(this.border, 0, 0);
            var textAlign = this.getDrawOption("textAlign");
            switch (textAlign) {
                case "right":
                case "end":
                    context.translate(this.width - this.padding.left, this.padding.top);
                    break;
                case "center":
                    context.translate(this.width / 2, this.padding.top);
                    break;
                default:
                    context.translate(this.padding.left, this.padding.top);
            }
            _super.prototype.draw.call(this, context);
        };
        return BorderLabel;
    })(jg.Label);
    jgui.BorderLabel = BorderLabel;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var Spinner = (function (_super) {
        __extends(Spinner, _super);
        function Spinner(width, height) {
            _super.call(this);

            this.step = 1;

            this.width = width;
            this.height = height;
            this.arrow_height = 10;
            this.entities = [];

            this.enablePointingEvent();

            this.changed = new jg.Trigger();

            this.build();
        }
        Spinner.prototype.build = function () {
            var value = "0";
            if (this.up_arrow)
                this.up_arrow.remove();
            if (this.down_arrow)
                this.down_arrow.remove();
            if (this.text_box) {
                value = this.text_box.text;
                this.text_box.remove();
            }
            this.up_arrow = new jgui.UpArrow(this.width, this.arrow_height);
            this.down_arrow = new jgui.DownArrow(this.width, this.arrow_height);
            this.text_box = new jgui.BorderLabel(value, this.height - this.arrow_height * 2 - 12);

            this.text_box.setTextAlign(this.text_align ? this.text_align : "right");
            var text_width = this.width - this.text_box.padding.left - this.text_box.padding.right;
            this.text_box.setMaxWidth(text_width);
            this.text_box.setFixWidth(text_width);

            this.append(this.up_arrow);
            this.append(this.down_arrow);
            this.append(this.text_box);

            this.up_arrow.moveTo(0, 0);
            this.down_arrow.moveTo(0, this.height - this.arrow_height);
            this.text_box.moveTo(0, this.arrow_height + 2);

            this.up_arrow.click.handle(this, this.onUp);
            this.down_arrow.click.handle(this, this.onDown);
        };

        Spinner.prototype.setFocusEntities = function (fm) {
            if (this.label_focus)
                fm.addEntity(this.up_arrow, this.text_box, this.down_arrow);
else
                fm.addEntity(this.up_arrow, this.down_arrow);
        };

        Spinner.prototype.getValue = function () {
            return Number(this.text_box.text);
        };

        Spinner.prototype.setValue = function (value) {
            if (value != Math.round(value))
                this.text_box.setText((Math.round(value * 100) / 100).toString());
else
                this.text_box.setText(value.toString());
            this.changed.fire(this);
        };

        Spinner.prototype.onUp = function () {
            this.setValue(this.getValue() - this.step);
        };

        Spinner.prototype.onDown = function () {
            this.setValue(this.getValue() + this.step);
        };
        return Spinner;
    })(jg.E);
    jgui.Spinner = Spinner;
})(jgui || (jgui = {}));
var jgui;
(function (jgui) {
    var ListBox = (function (_super) {
        __extends(ListBox, _super);
        function ListBox(scene, width, height, row_height) {
            _super.call(this);
            this.scene = scene;
            this.width = width;
            this.height = height;
            this.layer = new jg.Layer(scene);
            this.layer.parent = this;
            this.layer.width = this.width;
            this.layer.height = this.height;
            this.layer.createBuffer();
            this.layer.scrollTo(0, 0);
            this.row_height = row_height ? row_height : 20;
            this.padding = new jg.Rectangle(4, 4, 4, 4);

            this.up_scroll_button = new jgui.UpArrow(24, 16);
            this.down_scroll_button = new jgui.DownArrow(24, 16);
            this.entities = [];
            this.append(this.up_scroll_button);
            this.append(this.down_scroll_button);
            this.up_scroll_button.moveTo(this.width - this.up_scroll_button.width, 0);
            this.up_scroll_button.click.handle(this, this.onUp);
            this.down_scroll_button.moveTo(this.width - this.down_scroll_button.width, this.height - this.down_scroll_button.height);
            this.down_scroll_button.click.handle(this, this.onDown);

            this.enablePointingEvent();

            this.inner_focus = 0;
            this.updateScrollStatus();

            this.pointDown.handle(this, this.onPointDown);
            this.pointMove.handle(this, this.onPointMove);
            this.pointUp.handle(this, this.onPointUp);
        }
        ListBox.prototype.onPointDown = function (e) {
            var p = {
                x: e.point.x - this.layer.scroll.x,
                y: e.point.y - this.layer.scroll.y
            };
            this.pointing_entity = this.layer.getEntityByPoint(p);
            if (this.pointing_entity && this.pointing_entity.pointDown) {
                var e2 = new jg.InputPointEvent(jg.InputEventAction.Down, e.param, p);
                e2.set(this.pointing_entity);
                this.pointing_entity.pointDown.fire(e2);
            }
        };
        ListBox.prototype.onPointMove = function (e) {
            var p = {
                x: e.point.x - this.layer.scroll.x,
                y: e.point.y - this.layer.scroll.y
            };
            if (this.pointing_entity && this.pointing_entity.pointMove) {
                var e2 = new jg.InputPointEvent(jg.InputEventAction.Move, e.param, p);
                e2.set(this.pointing_entity);
                this.pointing_entity.pointMove.fire(e2);
            }
        };
        ListBox.prototype.onPointUp = function (e) {
            var p = {
                x: e.point.x - this.layer.scroll.x,
                y: e.point.y - this.layer.scroll.y
            };
            if (this.pointing_entity && this.pointing_entity.pointUp) {
                var e2 = new jg.InputPointEvent(jg.InputEventAction.Up, e.param, p);
                e2.set(this.pointing_entity);
                this.pointing_entity.pointUp.fire(e2);
            }
        };

        ListBox.prototype.updateScrollStatus = function () {
            var index = this.inner_focus;
            var ypos = index * this.row_height + this.layer.scroll.y;
            var visible_height = this.getVisibleHeight();
            var is_scroll = false;
            if ((ypos + this.row_height) > visible_height) {
                this.layer.scrollBy(0, visible_height - ypos - this.row_height);
                is_scroll = true;
            } else if (ypos < 0) {
                this.layer.scrollBy(0, -ypos);
                is_scroll = true;
            } else
                this.layer.updated();

            if (this.layer.scroll.y < 0)
                this.up_scroll_button.opacity = 0.5;
else
                this.up_scroll_button.opacity = 0;

            if ((visible_height - this.layer.scroll.y) < (this.layer.entities.length * this.row_height))
                this.down_scroll_button.opacity = 0.5;
else
                this.down_scroll_button.opacity = 0;

            return is_scroll;
        };

        ListBox.prototype.setFocusEntities = function (fm) {
            if (this.focus_manager !== undefined)
                throw "can not reset focusmanager";
            this.focus_manager = fm;
            var entities = this.layer.entities;
            for (var i = 0; i < entities.length; i++)
                fm.addEntity(entities[i]);
            this.focus_manager.changed.handle(this, this.onFocusChanged);
            this.updateScrollStatus();
        };

        ListBox.prototype.onUp = function () {
            if (this.up_scroll_button.opacity == 0)
                return;
            do {
                this.inner_focus--;
                if (this.inner_focus < 0)
                    this.inner_focus += this.layer.entities.length;
            } while(!this.updateScrollStatus());
        };

        ListBox.prototype.onDown = function () {
            if (this.down_scroll_button.opacity == 0)
                return;
            do {
                this.inner_focus++;
                if (this.inner_focus >= this.layer.entities.length)
                    this.inner_focus -= this.layer.entities.length;
            } while(!this.updateScrollStatus());
        };

        ListBox.prototype.onFocusChanged = function (e) {
            var target = e.current;
            var index = this.findItem(target);
            if (index >= 0) {
                this.inner_focus = index;
                this.updateScrollStatus();
            }
        };

        ListBox.prototype.findItem = function (entity) {
            var entities = this.layer.entities;
            for (var i = 0; i < entities.length; i++) {
                if (entities[i] == entity)
                    return i;
            }
            return -1;
        };

        ListBox.prototype.moveToLeft = function (entity) {
            entity.x = this.padding.left;
        };

        ListBox.prototype.moveToCenter = function (entity) {
            entity.x = (this.width - this.padding.left - this.padding.right) / 2 - entity.width / 2;
        };

        ListBox.prototype.moveToRight = function (entity) {
            entity.x = (this.width - this.padding.right) - entity.width;
        };

        ListBox.prototype.addItem = function (entity, manual_refresh) {
            entity.x = 0;
            entity.y = this.layer.entities.length * this.row_height;
            if (entity instanceof jg.Label) {
                var label = entity;
                if (entity instanceof jgui.BorderLabel) {
                    var bl = label;
                    bl.padding = new jg.Rectangle(this.padding.left, this.padding.top, this.padding.right, this.padding.bottom);
                    var bl_width = this.width - bl.padding.left - bl.padding.right;
                    bl.setMaxWidth(bl_width);
                    bl.setFixWidth(bl_width);
                    bl.setFontSize(this.row_height - bl.padding.top - bl.padding.bottom);
                } else {
                    label.y += this.padding.top;
                    label.x += this.padding.left;
                    label.setMaxWidth(this.width - this.padding.left - this.padding.right);
                    label.setFontSize(this.row_height - this.padding.top - this.padding.bottom);
                }
                label.updateSize();
            } else {
                entity.x += this.padding.left;
                entity.y += this.padding.top;
            }
            this.layer.append(entity);
            this.updateScrollStatus();
        };

        ListBox.prototype.setBg = function (bg) {
            this.bg = (bg instanceof jg.E) ? bg.createSprite().image : bg;
            if (this.bg.width != this.width || this.bg.height != this.height) {
                var canvas = window.createCanvas(this.width, this.height);
                var context = canvas.getContext("2d");
                context.drawImage(this.bg, 0, 0, this.bg.width, this.bg.height, 0, 0, this.width, this.height);
                this.bg = canvas;
            }
            this.updated();
        };

        ListBox.prototype.getVisibleHeight = function () {
            return Math.floor((this.height - this.padding.top) / this.row_height) * this.row_height;
        };

        ListBox.prototype.draw = function (context) {
            if (this.bg) {
                context.drawImage(this.bg, 0, 0);
            } else {
                context.save();
                context.lineWidth = 1;
                context.beginPath();
                context.rect(0, 0, this.width, this.height);
                context.stroke();
                context.restore();
            }

            var layer = this.layer;
            this.layer.context.clearRect(0, 0, this.layer.width, this.layer.height);
            this.scene.game.renderer.renderParent(this.layer, this.layer.context);
            layer.isUpdated = false;

            var visible_height = this.getVisibleHeight();
            context.drawImage(this.layer.canvas, 0, 0, this.width, visible_height, 0, 0, this.width, visible_height);
        };

        ListBox.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.layer.destroy();
        };
        return ListBox;
    })(jg.E);
    jgui.ListBox = ListBox;
})(jgui || (jgui = {}));
