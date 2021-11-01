### Exit Code Guide

Application handles the following exit codes:

| Code  | Reason                                                       |
| ----- | ------------------------------------------------------------ |
| **0** | Succesful, no error                                          |
| **1** | **Not yet implemented**, reserved for uncaught system errors |
| **2** | Bootstrap failed, cause can be seen in the logs              |
| **3** | Startup failed, cause can be seen in the logs                |
| **4** | Graceful shutdown failed, cause can be seen in the logs      |
| **5** | Graceful shutdown timedout                                   |
