(this["webpackJsonpreact-frontend"] = this["webpackJsonpreact-frontend"] || []).push([
  [0],
  {
    18: function(e, t, a) {
      e.exports = a.p + "static/media/logo.5d5d9eef.svg";
    },
    21: function(e, t, a) {
      e.exports = a(46);
    },
    44: function(e, t, a) {},
    45: function(e, t, a) {},
    46: function(e, t, a) {
      "use strict";
      a.r(t);
      var n = a(0),
        r = a.n(n),
        s = a(14),
        o = a.n(s),
        i = a(2),
        c = a.n(i),
        l = a(3),
        u = a(15),
        p = a(16),
        d = a(19),
        m = a(17),
        g = a(20),
        h = a(4),
        v = a.n(h),
        f = (a(44), a(18)),
        w = a.n(f),
        S = function(e, t) {
          localStorage.setItem("token", e), localStorage.setItem("expiry", t);
        },
        b = function() {
          localStorage.removeItem("token"), localStorage.removeItem("expiry");
        },
        k = function() {
          var e = localStorage.getItem("expiry");
          return !!e && +new Date(e) > +new Date();
        },
        E = function() {
          return { Authorization: "Bearer ".concat(localStorage.getItem("token")) };
        },
        y = (function(e) {
          function t() {
            var e, a;
            Object(u.a)(this, t);
            for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++) r[s] = arguments[s];
            return (
              ((a = Object(d.a)(this, (e = Object(m.a)(t)).call.apply(e, [this].concat(r)))).state = {
                email: "",
                password: "",
                isRequesting: !1,
                isLoggedIn: !1,
                data: [],
                error: "",
              }),
              (a.handleLogin = Object(l.a)(
                c.a.mark(function e() {
                  var t, n, r, s, o, i, l;
                  return c.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = a.state),
                              (n = t.email),
                              (r = t.password),
                              (e.prev = 1),
                              a.setState({ error: "" }),
                              a.setState({ isRequesting: !0 }),
                              (e.next = 6),
                              v.a.post("/api/users/login", { email: n, password: r })
                            );
                          case 6:
                            (s = e.sent),
                              (o = s.data),
                              (i = o.token),
                              (l = o.expiry),
                              S(i, l),
                              a.setState({ isLoggedIn: !0 }),
                              (e.next = 15);
                            break;
                          case 12:
                            (e.prev = 12), (e.t0 = e.catch(1)), a.setState({ error: "Something went wrong" });
                          case 15:
                            return (e.prev = 15), a.setState({ isRequesting: !1 }), e.finish(15);
                          case 18:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[1, 12, 15, 18]]
                  );
                })
              )),
              (a.logout = function() {
                b(), a.setState({ isLoggedIn: !1 });
              }),
              (a.getTestData = Object(l.a)(
                c.a.mark(function e() {
                  var t;
                  return c.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.prev = 0), a.setState({ error: "" }), (e.next = 4), v.a.get("/api/items", { headers: E() });
                          case 4:
                            (t = e.sent), a.setState({ data: t.data }), (e.next = 11);
                            break;
                          case 8:
                            (e.prev = 8), (e.t0 = e.catch(0)), a.setState({ error: "Something went wrong" });
                          case 11:
                            return (e.prev = 11), a.setState({ isRequesting: !1 }), e.finish(11);
                          case 14:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[0, 8, 11, 14]]
                  );
                })
              )),
              a
            );
          }
          return (
            Object(g.a)(t, e),
            Object(p.a)(t, [
              {
                key: "componentDidMount",
                value: function() {
                  this.setState({ isLoggedIn: k() });
                },
              },
              {
                key: "render",
                value: function() {
                  var e = this;
                  return r.a.createElement(
                    "div",
                    { className: "App" },
                    r.a.createElement(
                      "header",
                      { className: "App-header" },
                      r.a.createElement("img", { src: w.a, className: "App-logo", alt: "logo" }),
                      r.a.createElement("h1", { className: "App-title" }, "Welcome to React")
                    ),
                    r.a.createElement("div", { className: "App-error" }, this.state.error),
                    this.state.isLoggedIn
                      ? r.a.createElement(
                          "div",
                          { className: "App-private" },
                          r.a.createElement(
                            "div",
                            null,
                            "Server test data:",
                            r.a.createElement(
                              "ul",
                              null,
                              this.state.data.map(function(e, t) {
                                return r.a.createElement("li", { key: t }, "name: ", e.name, " / value: ", e.value);
                              })
                            )
                          ),
                          r.a.createElement("button", { disabled: this.state.isRequesting, onClick: this.getTestData }, "Get test data"),
                          r.a.createElement("button", { disabled: this.state.isRequesting, onClick: this.logout }, "Log out")
                        )
                      : r.a.createElement(
                          "div",
                          { className: "App-login" },
                          "(try the credentials: testuser@email.com / my-password)",
                          r.a.createElement("input", {
                            disabled: this.state.isRequesting,
                            placeholder: "email",
                            type: "text",
                            onChange: function(t) {
                              return e.setState({ email: t.target.value });
                            },
                          }),
                          r.a.createElement("input", {
                            disabled: this.state.isRequesting,
                            placeholder: "password",
                            type: "password",
                            onChange: function(t) {
                              return e.setState({ password: t.target.value });
                            },
                          }),
                          r.a.createElement("button", { disabled: this.state.isRequesting, onClick: this.handleLogin }, "Log in")
                        )
                  );
                },
              },
            ]),
            t
          );
        })(r.a.Component);
      a(45),
        Boolean(
          "localhost" === window.location.hostname ||
            "[::1]" === window.location.hostname ||
            window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
        );
      o.a.render(r.a.createElement(y, null), document.getElementById("root")),
        "serviceWorker" in navigator &&
          navigator.serviceWorker.ready.then(function(e) {
            e.unregister();
          });
    },
  },
  [[21, 1, 2]],
]);
//# sourceMappingURL=main.b9b9e738.chunk.js.map
