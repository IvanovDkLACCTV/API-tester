powershell -c "irm bun.sh/install.ps1|iex"


bun build --compile --target=bun-windows-x64 ./bun_server.js --outfile api-tester