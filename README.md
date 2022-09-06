# Node api monitor (Cachet Slack Notifier)

This container will detect the changes in Cachet status page status and it will send notifications on slack channel.


## Usage

```bash
git clone https://github.com/bhupiiidx/node-api-monitor.git
cd node-appi-monitor
docker-compose pull
cp env.example .env
vim .env    # add cachet api url and slack webhook url
docker-compose up -d
```



## Contributing

Contributions are always welcome! For major changes, please open an issue first to discuss what you would like to change.

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


## Author

- [@bhupiiidx](https://github.com/bhupiiidx)
- [@asabhi6776](https://www.github.com/asabhi6776)


## License

[MIT](https://choosealicense.com/licenses/mit/)

