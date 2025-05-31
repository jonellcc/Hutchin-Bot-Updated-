/*
@JohnSteveCostaños as known @ChoruOfficial
#* Btw this template is default only *#*/
//# Doesn't need express
module.exports = function(router){

	router.get('/', function(req, res) {
		res.json({hello:'world'});
	});

	return router;
}
