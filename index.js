/*
@JohnSteveCostaños as known @ChoruOfficial
#* Btw this template is default only *#*/
//# Doesn't need express
module.exports = function(router) {
  router.get('/', (req, res) => {
    res.send('OwnersV2 lel');
  });

  router.get('/:id', (req, res) => {
    res.send(`Product ${req.params.id} from OwnersV2`);
  });
};
