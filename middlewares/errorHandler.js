// error handler

const err = function (err, req, res, next) {
    // render the error page
    // res.status(err.status || 500);
    if (err.status == 404) {
        if (err.admin) {
            res.render("errorAdmin", { error: err.message });
        } else {
            res.render("errorUser", { error: err.message });
        }
    } else {
        if (err.status == 500) {
            res.render("500", { error: "unfinded error" });
        } else {
            if (err.admin) {
                res.render("errorAdmin", { error: "server down" });
            } else {
                res.render("errorUser", { error: "server down" });
            }
        }
    }
};

module.exports = { err };